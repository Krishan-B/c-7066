/**
 * Vitest Configuration for Trade-Pro
 * Optimized testing setup with comprehensive coverage
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
      host: 'ubiquitous-palm-tree-v6w5664v55jqcpgj7-8080.app.github.dev',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./client/src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'tests/e2e/**',
      'playwright.config.ts',
    ],

    // Test execution settings
    testTimeout: 15000,
    hookTimeout: 15000,
    maxConcurrency: 4,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/tests/**',
        'src/test/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        '**/*.d.ts',
      ],
    },

    // Reporter configuration
    reporters: ['verbose'],
    outputFile: {
      json: './test-results.json',
    },

    // Performance optimization
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 3,
      },
    },
    watch: false,
  },
});
