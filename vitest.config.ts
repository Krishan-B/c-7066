/**
 * Vitest configuration for Trade-Pro
 * - Test runner and coverage settings
 * - See PROJECT_CLEANUP_AND_CONFIG.md for details
 */

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
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', 'tests/e2e/**'],

    // Enhanced test execution settings
    testTimeout: 30000,
    hookTimeout: 30000,
    maxConcurrency: 5,

    // Optimized typecheck configuration
    typecheck: {
      tsconfig: './tsconfig.app.json',
      include: ['**/*.{test,spec}.{ts,tsx}'],
      checker: 'tsc',
    },

    // Comprehensive coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75,
      },
      include: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/test/**'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        'src/test/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
      ],
      watermarks: {
        statements: [70, 85],
        functions: [70, 85],
        branches: [65, 80],
        lines: [70, 85],
      },
    },

    // Enhanced reporter configuration
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json',
    },

    // Test isolation and cleanup
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
    // Watch mode configuration
    watch: false,
  },
});
