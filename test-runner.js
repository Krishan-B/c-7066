// Simple test runner to verify our setup
const { execSync } = require('child_process');

console.log('🔍 Checking Vitest installation...');
try {
  const vitestVersion = execSync('npx vitest --version', { encoding: 'utf8' });
  console.log(`✅ Vitest found: ${vitestVersion.trim()}`);
} catch (error) {
  console.log('❌ Vitest not found:', error.message);
  process.exit(1);
}

console.log('\n🔍 Listing test files...');
try {
  const testFiles = execSync('find tests -name "*.test.*" -o -name "*.spec.*"', { encoding: 'utf8' });
  console.log('📁 Test files found:');
  console.log(testFiles);
} catch (error) {
  console.log('❌ Error listing test files:', error.message);
}

console.log('\n🧪 Running a simple test...');
try {
  const result = execSync('npx vitest run tests/security/auth/auth-utils.test.ts --reporter=basic --no-coverage --run', { 
    encoding: 'utf8',
    timeout: 30000 
  });
  console.log('✅ Test execution successful:');
  console.log(result);
} catch (error) {
  console.log('❌ Test execution failed:');
  console.log('Error:', error.message);
  if (error.stdout) {
    console.log('STDOUT:', error.stdout);
  }
  if (error.stderr) {
    console.log('STDERR:', error.stderr);
  }
}
