import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// Vite configuration for client
export const clientConfig = defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../client/src'),
    },
  },
  build: {
    outDir: '../client/dist',
  },
});

// Vite configuration for server (for build tooling)
export const serverConfig = defineConfig({
  build: {
    outDir: 'dist',
    ssr: true,
    rollupOptions: {
      input: 'server/index.ts',
      output: {
        format: 'esm',
        entryFileNames: '[name].js',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../server'),
    },
  },
});
