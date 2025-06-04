import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    typecheck: {
      tsconfig: './tsconfig.app.json',
      include: ['**/*.{test,spec}.{ts,tsx}'],
    },
    coverage: {
      reporter: ['text', 'html'],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        'src/test/**',
      ],
    },
  },
});
