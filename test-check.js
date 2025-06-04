// Simple test to check if testing framework works
import { exec } from 'child_process';

console.log('Testing framework check...');

exec('npx vitest --version', (error, stdout, stderr) => {
    if (error) {
        console.error('Error running vitest:', error);
        return;
    }
    console.log('Vitest version:', stdout);

    // Try running a simple test
    exec('npx vitest run --reporter=verbose tests/security/auth/auth-utils.test.ts', (error, stdout, stderr) => {
        if (error) {
            console.error('Error running tests:', error);
            console.error('Stderr:', stderr);
        } else {
            console.log('Test output:', stdout);
        }
    });
});
