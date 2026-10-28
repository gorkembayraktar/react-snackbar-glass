import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  plugins: [react()],
  resolve: {
    alias: {
      '@lib': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [fileURLToPath(new URL('.', import.meta.url))],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
