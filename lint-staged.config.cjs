module.exports = {
  // Only lint and fix source files, skip test and generated files
  'src/**/*.{js,jsx,ts,tsx}': [
    'eslint --fix --max-warnings=0',
    'git add'
  ],
  // Format markdown and JSON files
  '*.{md,json}': [
    'prettier --write',
    'git add'
  ],
  // Type check TypeScript files
  'src/**/*.{ts,tsx}': () => 'tsc --noEmit'
};
