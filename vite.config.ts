
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    types: ['jest', '@testing-library/jest-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'radix-core': [
            '@radix-ui/react-tabs',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip',
          ],
          'radix-forms': [
            '@radix-ui/react-form',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-toggle',
          ],
          'chart-vendor': ['recharts'],
          'data-vendor': ['@tanstack/react-query'],
          'auth-vendor': ['@supabase/supabase-js'],
          'date-utils': ['date-fns'],
          'form-utils': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-animations': ['framer-motion', 'tailwindcss-animate'],
        },
        inlineDynamicImports: false,
        chunkFileNames: '[name]-[hash].js',
      },
    },
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    reportCompressedSize: false,
  },
}));
