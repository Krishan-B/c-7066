// Performance-optimized ESLint configuration
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  // Global ignores for maximum performance
  {
    ignores: [
      // Build outputs
      'dist/**',
      'build/**',
      '*.tsbuildinfo',

      // Dependencies
      'node_modules/**',

      // Test files (exclude ALL test files for performance)
      'tests/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/test/**',
      '**/tests/**',

      // Coverage and outputs
      'coverage/**',
      '.nyc_output/**',
      '*.test.js.snap',
      '__snapshots__/**',

      // Cache files
      '.eslintcache',
      '.cache/**',

      // Environment and config files
      '.env*',
      'vite.config.ts',
      'tailwind.config.ts',
      'postcss.config.js',
      'vitest.config.ts',

      // Type definitions
      '**/*.d.ts',

      // Static assets
      'public/**',
      'docs/**',

      // Supabase functions
      'supabase/functions/**',

      // OS and editor files
      '.DS_Store*',
      '._*',
      'Thumbs.db',
      '*.swp',
      'tmp/**',
      'temp/**',
    ],
  },

  // Simplified TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React hooks rules
      ...reactHooks.configs.recommended.rules,

      // React refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],

      // Relaxed rules for development
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Unused imports rules
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },

  // JavaScript files configuration
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React hooks rules
      ...reactHooks.configs.recommended.rules,

      // Standard JavaScript rules
      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],

      // Unused imports rules
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  }
);
