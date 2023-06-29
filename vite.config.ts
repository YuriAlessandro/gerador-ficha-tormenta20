/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    checker({
      overlay: { initialIsOpen: false },
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    viteTsconfigPaths(),
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
    }) as Plugin,
  ],
});
