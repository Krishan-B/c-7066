/**
 * Lint-staged configuration for Trade-Pro
 * - Formats and lints staged files before commit
 * - See PROJECT_CLEANUP_AND_CONFIG.md for details
 */

module.exports = {
  // Only lint and fix source files, skip test and generated files
  'src/**/*.{js,jsx,ts,tsx}': ['eslint --fix --max-warnings=0 --no-warn-ignored'],
  // Format markdown and JSON files
  '*.{md,json}': ['prettier --write'],
  // Type check TypeScript files (using pnpm to avoid npm warnings)
  'src/**/*.{ts,tsx}': () => 'pnpm exec tsc --noEmit',
};
