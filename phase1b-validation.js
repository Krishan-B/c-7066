// Quick validation script for Phase 1B implementation
console.log('🔍 Phase 1B Security Implementation Validation\n');

// Check if core components exist
const fs = require('fs');
const path = require('path');

const componentsToCheck = [
  'src/features/auth/components/OAuthLogin.tsx',
  'src/features/auth/components/OAuthCallback.tsx',
  'src/features/auth/components/UserAgreements.tsx',
  'src/features/auth/components/TwoFactorSetup.tsx',
  'src/features/auth/components/EnhancedLoginPage.tsx',
  'src/features/auth/components/EnhancedRegisterPage.tsx',
  'src/utils/security/securityUtils.ts',
  'src/utils/auth/authUtils.ts',
  'src/utils/security/securityConfig.ts',
  'tests/phase1b-comprehensive.test.ts',
];

console.log('📁 Checking Phase 1B component files:');
let allFilesExist = true;

componentsToCheck.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);

  if (exists) {
    const stats = fs.statSync(file);
    console.log(
      `   Size: ${Math.round(
        stats.size / 1024
      )}KB, Modified: ${stats.mtime.toLocaleString()}`
    );
  }

  if (!exists) allFilesExist = false;
});

console.log(
  `\n📊 Overall Status: ${
    allFilesExist ? '✅ All files present' : '❌ Missing files detected'
  }`
);

// Check test file structure
if (fs.existsSync('tests/phase1b-comprehensive.test.ts')) {
  console.log('\n🧪 Test file analysis:');
  const testContent = fs.readFileSync(
    'tests/phase1b-comprehensive.test.ts',
    'utf8'
  );

  const testStats = {
    lines: testContent.split('\n').length,
    describe_blocks: (testContent.match(/describe\(/g) || []).length,
    it_blocks: (testContent.match(/it\(/g) || []).length,
    imports: (testContent.match(/^import /gm) || []).length,
  };

  console.log(`   Lines: ${testStats.lines}`);
  console.log(`   Describe blocks: ${testStats.describe_blocks}`);
  console.log(`   Test cases (it blocks): ${testStats.it_blocks}`);
  console.log(`   Import statements: ${testStats.imports}`);
}

// Check package.json for dependencies
if (fs.existsSync('package.json')) {
  console.log('\n📦 Checking test dependencies:');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const testDeps = [
    'vitest',
    '@testing-library/react',
    '@testing-library/jest-dom',
  ];
  testDeps.forEach(dep => {
    const hasDevDep =
      packageJson.devDependencies && packageJson.devDependencies[dep];
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    const status = hasDevDep || hasDep ? '✅' : '❌';
    console.log(`${status} ${dep}`);
  });
}

console.log('\n🎯 Phase 1B Implementation Status: READY FOR TESTING');
console.log('Next step: Execute comprehensive security tests');
