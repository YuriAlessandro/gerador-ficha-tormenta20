/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// Version used for cache naming - changing this invalidates all PWA caches
const APP_VERSION = '4.3';

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
        // Load custom push notification handler in the service worker
        importScripts: ['push-sw.js'],
        // Exclude HTML from precache - let it be handled by NetworkFirst runtime caching
        // This ensures users always get the latest HTML on navigation
        globPatterns: ['**/*.{js,css,ico,png,svg,json,wasm}'],
        // Don't precache index.html - always fetch fresh
        navigateFallback: null,
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MB limit (increased for large bundle)
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
