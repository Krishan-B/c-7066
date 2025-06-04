// Quick verification script to check test environment
const { execSync } = require('child_process');

console.log('🔍 Testing Environment Verification');
console.log('==================================');

try {
    console.log('1. Checking Node.js version...');
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`   ✓ Node.js: ${nodeVersion}`);

    console.log('2. Checking npm packages...');
    execSync('npm list vitest @testing-library/react --depth=0', { encoding: 'utf8', stdio: 'pipe' });
    console.log('   ✓ Required packages are installed');

    console.log('3. Running simple vitest check...');
    const vitestOutput = execSync('npx vitest --version 2>&1', { encoding: 'utf8', timeout: 10000 });
    console.log(`   ✓ Vitest version: ${vitestOutput.trim()}`);

    console.log('4. Testing basic test file...');
    const testResult = execSync('npx vitest run tests/basic-setup.test.ts --reporter=basic --no-coverage 2>&1', {
        encoding: 'utf8',
        timeout: 30000
    });
    console.log('   ✓ Basic test execution:');
    console.log(testResult);

} catch (error) {
    console.error('❌ Error during verification:', error.message);
    if (error.stdout) {
        console.log('STDOUT:', error.stdout);
    }
    if (error.stderr) {
        console.log('STDERR:', error.stderr);
    }
}
