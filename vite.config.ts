/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import {
  isPremiumAvailable,
  premiumStubPlugin,
} from './scripts/premiumStubPlugin';

// Fonte única da versão: `package.json`. Além de nomear os caches do PWA
// (bumpar a versão invalida todos), é exposta ao bundle como `__APP_VERSION__`
// para o relatório do ErrorBoundary — sem ela não dá para saber se um bug
// reportado veio da versão atual ou de um build antigo preso no cache.
const APP_VERSION: string = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')
).version;

const premiumAvailable = isPremiumAvailable(__dirname);

// Plugin to handle SPA routing for paths with dots (e.g., /perfil/user.name)
// This runs AFTER Vite's middleware to catch 404s on client-side routes
function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      // Use a hook that runs after Vite's built-in middleware
      return () => {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const accept = req.headers.accept || '';

          // Only handle navigation requests (HTML pages)
          const isNavigationRequest = accept.includes('text/html');

          // Skip internal Vite paths and actual file requests
          const isInternalPath =
            url.startsWith('/@') ||
            url.startsWith('/node_modules') ||
            url.startsWith('/src/') ||
            url.startsWith('/__');

          // Skip known file extensions
          const hasFileExtension =
            /\.(js|jsx|ts|tsx|css|scss|less|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map|webp|pdf|html|wasm|mjs|cjs)$/i.test(
              url
            );

          if (isNavigationRequest && !isInternalPath && !hasFileExtension) {
            req.url = '/index.html';
          }
          next();
        });
      };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'spa',
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  // Dev-only: proxia /api para o backend local. Usado ao testar a ficha
  // embutida no Owlbear (frontend via túnel HTTPS) rodando com VITE_API_URL=/
  // — evita mixed content e CORS. Não afeta o build de produção.
  server: {
    // Dev-only: libera hosts de túnel (ngrok/cloudflared) ao testar a ficha
    // embutida no Owlbear. Não tem efeito no build de produção.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_PROXY || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  base: '/',
  plugins: [
    spaFallbackPlugin(),
    ...(premiumAvailable ? [] : [premiumStubPlugin(__dirname)]),
    react(),
    // O checker roda tsc e eslint sobre todo o src — medido em 1.8 GB (tsc) +
    // 2.1 GB (eslint) de pico, dentro do processo do dev server e re-rodando a
    // cada save. Somado ao servidor isso estourava a RAM do WSL e o kernel
    // matava o `npm start` por OOM. O editor já roda tsserver e eslintServer,
    // então em dev isso era o mesmo trabalho pago duas vezes.
    //
    // Agora é opt-in: `VITE_CHECK=1 npm start` para ter o overlay de volta.
    // O portão de verdade continua sendo `npx tsc --noEmit` + eslint no CI.
    //
    // Sem o submódulo premium ele fica desligado de qualquer forma: os 173
    // imports viram TS2307 e o overlay cobre a tela — o stub resolve em
    // runtime, mas não no type-check.
    ...(premiumAvailable && process.env.VITE_CHECK === '1'
      ? [
          checker({
            overlay: { initialIsOpen: false },
            typescript: true,
            eslint: {
              lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
            },
          }),
        ]
      : []),
    viteTsconfigPaths(),
    VitePWA({
      registerType: 'prompt', // Prompt user to reload when update available
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Fichas de Nimb',
        short_name: 'Fichas de Nimb',
        description:
          'Gerador de fichas e ameaças para Tormenta 20 - Crie personagens e NPCs completos offline',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        // No 'orientation' field on purpose: omitting it makes the installed PWA
        // respect the device's system-level auto-rotate lock. Setting it to 'any'
        // forces rotation even when the user has auto-rotate disabled.
        scope: '/',
        start_url: '/',
        categories: ['games', 'utilities', 'entertainment'],
        lang: 'pt-BR',
        icons: [
          {
            src: 'android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'android-chrome-256x256.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'apple-icon-180x180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // Load custom push notification handler in the service worker
        importScripts: ['push-sw.js'],
        // Exclude HTML from precache - let it be handled by NetworkFirst runtime caching
        // This ensures users always get the latest HTML on navigation
        //
        // Só o app shell. O glob antigo (`**/*.{js,css,ico,png,svg,json,wasm}`)
        // pegava tudo: 129 arquivos, 31 MB — os 24 chunks de tela lazy, o
        // dice-box inteiro e 9,7 MB de PNG, sendo 7,9 MB em três imagens
        // decorativas. Isso significava 31 MB baixados a cada versão nova, e
        // uma janela de vários minutos, a cada deploy, em que o SW disputava
        // banda com as próprias telas que o usuário estava tentando abrir.
        //
        // As telas lazy continuam funcionando offline — só que pelo cache de
        // runtime, a partir da primeira visita naquela versão, em vez de
        // adiantado.
        globPatterns: [
          'assets/index-*.js',
          'assets/index-*.css',
          '*.{ico,png,svg,txt}',
        ],
        // `_routes.json` é config de deploy do Cloudflare Pages (define quais
        // caminhos invocam a Function), não asset da aplicação. O glob de .json
        // acima o pegaria e o service worker o precachearia à toa.
        globIgnores: ['_routes.json'],
        // Don't precache index.html - always fetch fresh
        navigateFallback: null,
        // O chunk principal já passa de 10 MB. Sem folga aqui o build quebra
        // (vite-plugin-pwa trata o aviso do workbox como erro). Solução de
        // verdade é code-splitting — ver manualChunks no aviso do rollup.
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20 MB limit
        // Clean up old caches on activation - important to remove stale assets
        cleanupOutdatedCaches: true,
        // DO NOT use skipWaiting with 'prompt' registerType
        // skipWaiting causes conflicts where the SW activates but old JS is still cached
        // The update will happen when user clicks "Update" in the notification
        skipWaiting: false,
        // DO NOT claim clients immediately - let user control the update
        clientsClaim: false,
        runtimeCaching: [
          {
            // HTML pages - always try network first to get latest version
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: `fdn-v${APP_VERSION}-html`,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              networkTimeoutSeconds: 3, // Fall back to cache if network takes > 3s
            },
          },
          {
            // JS and CSS files with hashes - these are immutable, cache first is OK
            urlPattern: ({ request, url }) =>
              (request.destination === 'script' ||
                request.destination === 'style') &&
              url.pathname.match(/\.[a-f0-9]{8}\./), // Match Vite hash pattern
            handler: 'CacheFirst',
            options: {
              cacheName: `fdn-v${APP_VERSION}-static`,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year (immutable)
              },
            },
          },
          {
            // Images, fonts and other assets
            urlPattern: ({ request }) =>
              request.destination === 'image' || request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: `fdn-v${APP_VERSION}-assets`,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Other same-origin requests - use StaleWhileRevalidate for balance
            // eslint-disable-next-line no-restricted-globals
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: `fdn-v${APP_VERSION}-general`,
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              plugins: [
                {
                  // Guarda contra envenenamento do cache local.
                  //
                  // O `_redirects` do Pages termina em `/* /index.html 200`, e
                  // o Pages não aceita 404 em `_redirects` — então um asset que
                  // falte por um instante (janela de propagação de um deploy)
                  // não dá 404: dá 200 com o HTML do SPA. Sem este guard o SWR
                  // guardava esse HTML sob a URL do `.js` por 7 dias, e o
                  // aparelho ficava com "Failed to fetch dynamically imported
                  // module" em toda navegação — só naquele dispositivo, com o
                  // servidor íntegro o tempo todo.
                  //
                  // Precisa ser livre de closure: o workbox-build serializa a
                  // função para dentro do `sw.js` gerado.
                  cacheWillUpdate: async ({
                    request,
                    response,
                  }: {
                    request: Request;
                    response: Response;
                  }) => {
                    const type = response.headers.get('content-type') || '';
                    const wantsCode =
                      request.destination === 'script' ||
                      request.destination === 'style';
                    if (wantsCode && type.includes('text/html')) return null;
                    return response;
                  },
                },
              ],
            },
          },
        ],
      },
    }),
  ],
});
