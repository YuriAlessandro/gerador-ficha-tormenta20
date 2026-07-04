import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    environment: 'jsdom',
    server: {
      deps: {
        // Inlina @base-ui e @mui (ESM-only) para que seus imports passem pelo
        // pipeline do Vite — o resolver ESM nativo do Node quebra em
        // 'react/jsx-runtime' sem extensão (React 17 não tem "exports" map)
        inline: [/@base-ui\//, /@mui\//],
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'react/jsx-runtime': 'react/jsx-runtime.js',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    },
  },
});
