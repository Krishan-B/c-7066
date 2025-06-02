import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  // Global ignores - migrated from .eslintignore
  {
    ignores: [
      // Build outputs
      "dist/**",
      "build/**",
      "*.tsbuildinfo",
      
      // Dependencies
      "node_modules/**",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      
      // Coverage and test outputs
      "coverage/**",
      ".nyc_output/**",
      "tests/coverage/**",
      "*.test.js.snap",
      "__snapshots__/**",
      
      // Cache files
      ".eslintcache",
      ".cache/**",
      
      // Environment files
      ".env*",
      
      // Config files - excluding this config file
      "vite.config.ts",
      "tailwind.config.ts",
      "postcss.config.js",
      "vitest.config.ts",
      
      // Type definitions
      "**/*.d.ts",
      
      // Static assets
      "public/**",
      "docs/**",
      
      // Supabase functions
      "supabase/functions/**",
      
      // OS and editor files
      ".DS_Store*",
      "._*",
      ".Spotlight-V100",
      ".Trashes",
      "ehthumbs.db",
      "Thumbs.db",
      "*.swp",
      "*.swo",
      
      // Temporary files
      "tmp/**",
      "temp/**"
    ]
  },{
    // Main configuration for TypeScript files with enhanced compatibility
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        // Simplified parser options for better compatibility
        warnOnUnsupportedTypeScriptVersion: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // React hooks rules
      ...reactHooks.configs.recommended.rules,

      // React refresh rules
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript performance-optimized rules with proper configuration
      "@typescript-eslint/no-unused-vars": ["warn", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }],

      // Fixed @typescript-eslint/no-unused-expressions rule
      "@typescript-eslint/no-unused-expressions": ["error", {
        "allowShortCircuit": true,
        "allowTernary": true,
        "allowTaggedTemplates": true
      }],

      "@typescript-eslint/consistent-type-imports": ["warn", {
        "fixStyle": "inline-type-imports",
        "prefer": "type-imports"
      }],      // Additional TypeScript rules for better development experience  
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      // Unused imports rules
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ],

      // General performance and security rules
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "prefer-const": "warn",
      "no-var": "error",
    },
  },  // Separate optimized config for JavaScript files
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // React hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // Standard JavaScript rules
      "no-unused-vars": ["warn", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }],
      
      // Unused imports rules
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ],

      // General performance and security rules
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "prefer-const": "warn",
      "no-var": "error",
    }
  }
);
