/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// Version used for cache naming - changing this invalidates all PWA caches
const APP_VERSION = '4.26.1';

const PREMIUM_DIR = path.resolve(__dirname, 'src/premium');
const PREMIUM_STUB_DIR = path.resolve(__dirname, 'src/premium-stub');

// O submódulo premium é privado. Sem ele (clone sem --recurse-submodules, ou
// contribuidor sem acesso ao repo), o diretório existe mas fica vazio.
// VITE_NO_PREMIUM=1 força o mesmo caminho mesmo com o submódulo presente,
// para conferir se o build público continua de pé.
const premiumAvailable =
  process.env.VITE_NO_PREMIUM !== '1' &&
  fs.existsSync(path.join(PREMIUM_DIR, 'index.ts'));

// Redireciona qualquer import que caia dentro de src/premium para o stub
// público em src/premium-stub. Trabalha sobre o caminho absoluto já resolvido,
// então cobre tanto `@/premium/...` quanto os `../premium/...` relativos dos
// barrels em src/services — nenhum arquivo de src/ precisa ser editado.
function premiumStubPlugin(): Plugin {
  return {
    name: 'premium-stub',
    enforce: 'pre',
    async resolveId(source, importer) {
      // O plugin `vite:alias` roda antes dos plugins `enforce: 'pre'`, então o
      // alias `@` já chega aqui expandido para caminho absoluto. Por isso as
      // três formas precisam ser tratadas.
      const [spec, query = ''] = source.split(/(?=\?)/, 2);
      let abs: string | null = null;
      if (spec === '@/premium' || spec.startsWith('@/premium/')) {
        abs = path.resolve(__dirname, 'src', spec.slice(2));
      } else if (path.isAbsolute(spec)) {
        abs = spec;
      } else if (/^\.{1,2}\//.test(spec) && importer) {
        abs = path.resolve(path.dirname(importer), spec);
      }
      if (!abs) return null;
      if (abs !== PREMIUM_DIR && !abs.startsWith(PREMIUM_DIR + path.sep))
        return null;

      const rel = path.relative(PREMIUM_DIR, abs);
      const target =
        (rel ? path.join(PREMIUM_STUB_DIR, rel) : PREMIUM_STUB_DIR) + query;
      const resolved = await this.resolve(target, importer, { skipSelf: true });
      if (!resolved) {
        this.error(
          `[premium-stub] falta stub para "${source}" (esperado em ${path.relative(
            __dirname,
            target
          )}). Adicione o módulo em src/premium-stub/.`
        );
      }
      return resolved;
    },
  };
}

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
    ...(premiumAvailable ? [] : [premiumStubPlugin()]),
    react(),
    // O checker roda tsc e eslint sobre todo o src. Sem o submódulo premium os
    // 173 imports viram TS2307 e o overlay cobre a tela — o stub resolve em
    // runtime, mas não no type-check. Desligado nesse modo de propósito.
    ...(premiumAvailable
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
        globPatterns: ['**/*.{js,css,ico,png,svg,json,wasm}'],
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
            },
          },
        ],
      },
    }),
  ],
});
