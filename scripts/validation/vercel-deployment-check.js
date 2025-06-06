/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

console.log('🔍 Vercel Deployment Readiness Check...');

try {
  // Check if security functions are properly implemented
  const securityFile = path.join(
    process.cwd(),
    'src',
    'utils',
    'security',
    'securityUtils.ts'
  );
  const content = fs.readFileSync(securityFile, 'utf8');

  const requiredFunctions = [
    'validateEmail',
    'validatePasswordStrength',
    'sanitizeInput',
    'hashPassword',
    'verifyPassword',
    'generateCSRFToken',
  ];

  console.log('\n📋 Checking security function implementations:');

  const functionStatus = requiredFunctions.map(fn => {
    const hasFunction =
      content.includes(`export function ${fn}`) ||
      content.includes(`export async function ${fn}`);
    console.log(`   ${hasFunction ? '✅' : '❌'} ${fn}`);
    return hasFunction;
  });

  const allFunctionsImplemented = functionStatus.every(status => status);

  // Check if dist folder exists (build successful)
  const distExists = fs.existsSync(path.join(process.cwd(), 'dist'));
  console.log(
    `\n🏗️  Build status: ${
      distExists
        ? '✅ SUCCESS (dist folder exists)'
        : '❌ FAILED (no dist folder)'
    }`
  );

  // Check if main entry files exist
  const indexHtmlExists = fs.existsSync(
    path.join(process.cwd(), 'dist', 'index.html')
  );
  console.log(`📄 Index file: ${indexHtmlExists ? '✅ EXISTS' : '❌ MISSING'}`);

  // Summary
  console.log('\n🎯 DEPLOYMENT READINESS SUMMARY:');
  console.log(
    `   Security Functions: ${
      allFunctionsImplemented ? '✅ COMPLETE' : '❌ INCOMPLETE'
    }`
  );
  console.log(`   Build Status: ${distExists ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   Entry Point: ${indexHtmlExists ? '✅ READY' : '❌ MISSING'}`);

  const deploymentReady =
    allFunctionsImplemented && distExists && indexHtmlExists;
  console.log(
    `\n🚀 VERCEL DEPLOYMENT: ${deploymentReady ? '✅ READY' : '❌ NOT READY'}`
  );

  if (deploymentReady) {
    console.log(
      '\n🎉 SUCCESS: The application is ready for Vercel deployment!'
    );
    console.log('   All security functions have been implemented.');
    console.log('   Build completed successfully.');
    console.log('   No missing function errors should occur in production.');
  } else {
    console.log(
      '\n⚠️  ISSUES FOUND: Please resolve the above issues before deployment.'
    );
  }
} catch (error) {
  console.log('❌ Error during verification:', error.message);
}
