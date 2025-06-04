console.log('Phase 1B Quick Check');
console.log('===================');

const fs = require('fs');

// Check key files
const files = [
    'src/features/auth/components/OAuthLogin.tsx',
    'src/utils/security/securityConfig.ts'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

console.log('Check complete.');
