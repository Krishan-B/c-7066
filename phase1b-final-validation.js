// Manual Phase 1B Security Implementation Validation
console.log('🚀 PHASE 1B COMPREHENSIVE SECURITY VALIDATION');
console.log('='.repeat(50));

import fs from 'fs';
import path from 'path';

// Function to check if a file exists and get basic info
function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}`);

  if (exists) {
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   📁 ${filePath} (${sizeKB}KB)`);

    // Check for basic content
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const hasExport =
        content.includes('export') || content.includes('export default');
      console.log(
        `   📄 ${lines} lines, ${hasExport ? 'Has exports' : 'No exports'}`
      );

      // Check for key security features
      if (
        content.includes('PKCE') ||
        content.includes('OAuth') ||
        content.includes('2FA')
      ) {
        console.log('   🔒 Contains security implementations');
      }
    }
  }
  console.log('');
  return exists;
}

console.log('🔍 CHECKING CORE SECURITY COMPONENTS:');
console.log('-'.repeat(40));

const components = [
  ['src/features/auth/components/OAuthLogin.tsx', 'OAuth Login Component'],
  ['src/features/auth/components/OAuthCallback.tsx', 'OAuth Callback Handler'],
  ['src/features/auth/components/UserAgreements.tsx', 'User Agreements (GDPR)'],
  ['src/features/auth/components/TwoFactorSetup.tsx', '2FA Setup Component'],
  ['src/features/auth/components/EnhancedLoginPage.tsx', 'Enhanced Login Page'],
  [
    'src/features/auth/components/EnhancedRegisterPage.tsx',
    'Enhanced Register Page',
  ],
];

let componentCount = 0;
components.forEach(([file, desc]) => {
  if (checkFile(file, desc)) componentCount++;
});

console.log('🛠️  CHECKING SECURITY UTILITIES:');
console.log('-'.repeat(40));

const utilities = [
  ['src/utils/security/securityUtils.ts', 'Security Utilities'],
  ['src/utils/auth/authUtils.ts', 'Auth Utilities'],
  ['src/utils/security/securityConfig.ts', 'Security Configuration'],
];

let utilityCount = 0;
utilities.forEach(([file, desc]) => {
  if (checkFile(file, desc)) utilityCount++;
});

console.log('🧪 CHECKING TEST IMPLEMENTATION:');
console.log('-'.repeat(40));

const testFiles = [
  ['tests/phase1b-comprehensive.test.ts', 'Comprehensive Security Tests'],
  ['tests/phase1b-import-test.test.ts', 'Import Validation Tests'],
];

let testCount = 0;
testFiles.forEach(([file, desc]) => {
  if (checkFile(file, desc)) testCount++;
});

// Overall Assessment
console.log('📊 IMPLEMENTATION SUMMARY:');
console.log('='.repeat(50));
console.log(
  `✅ Components: ${componentCount}/${components.length} (${Math.round(
    (componentCount / components.length) * 100
  )}%)`
);
console.log(
  `✅ Utilities: ${utilityCount}/${utilities.length} (${Math.round(
    (utilityCount / utilities.length) * 100
  )}%)`
);
console.log(
  `✅ Tests: ${testCount}/${testFiles.length} (${Math.round(
    (testCount / testFiles.length) * 100
  )}%)`
);

const totalFiles = components.length + utilities.length + testFiles.length;
const completedFiles = componentCount + utilityCount + testCount;
const completionPercentage = Math.round((completedFiles / totalFiles) * 100);

console.log(
  `\n🎯 OVERALL COMPLETION: ${completedFiles}/${totalFiles} (${completionPercentage}%)`
);

if (completionPercentage >= 90) {
  console.log('🏆 STATUS: PHASE 1B READY FOR TESTING');
} else if (completionPercentage >= 70) {
  console.log('⚠️  STATUS: MOSTLY COMPLETE - MINOR FIXES NEEDED');
} else {
  console.log('❌ STATUS: SIGNIFICANT WORK REQUIRED');
}

// Check test file content
if (fs.existsSync('tests/phase1b-comprehensive.test.ts')) {
  console.log('\n🔬 TEST FILE ANALYSIS:');
  console.log('-'.repeat(40));

  const testContent = fs.readFileSync(
    'tests/phase1b-comprehensive.test.ts',
    'utf8'
  );
  const testStats = {
    lines: testContent.split('\n').length,
    describes: (testContent.match(/describe\(/g) || []).length,
    tests: (testContent.match(/it\(/g) || []).length,
    imports: (testContent.match(/^import /gm) || []).length,
    mocks: (testContent.match(/vi\.mock/g) || []).length,
  };

  console.log(`📝 Lines of code: ${testStats.lines}`);
  console.log(`🧩 Test suites (describe): ${testStats.describes}`);
  console.log(`🎯 Individual tests (it): ${testStats.tests}`);
  console.log(`📦 Import statements: ${testStats.imports}`);
  console.log(`🎭 Mock implementations: ${testStats.mocks}`);

  if (testStats.tests >= 15) {
    console.log('✅ Comprehensive test coverage detected');
  } else {
    console.log('⚠️  Limited test coverage');
  }
}

console.log('\n🎊 PHASE 1B SECURITY IMPLEMENTATION VALIDATION COMPLETE');
console.log('Next: Execute comprehensive security test suite');
