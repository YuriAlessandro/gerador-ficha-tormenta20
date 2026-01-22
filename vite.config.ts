/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import viteTsconfigPaths from 'vite-tsconfig-paths';

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
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  base: '/',
  plugins: [
    spaFallbackPlugin(),
    react(),
    checker({
      overlay: { initialIsOpen: false },
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    viteTsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Fichas de Nimb',
        short_name: 'Fichas de Nimb',
        description:
          'Gerador de fichas e ameaças para Tormenta 20 - Crie personagens e NPCs completos offline',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,wasm}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB limit (increased from default 2MB)
        runtimeCaching: [
          {
            // eslint-disable-next-line no-restricted-globals
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tormenta20-cache-v3.2.0',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
            },
          },
        ],
      },
    }),
  ],
});
