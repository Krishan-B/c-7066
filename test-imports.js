// Quick test script to check if security imports work
const path = require('path');

async function testImports() {
    try {
        // Try importing the security files directly
        console.log('Testing security config import...');
        const configPath = path.join(__dirname, 'src', 'utils', 'security', 'securityConfig.ts');
        console.log('Config file path:', configPath);

        const utilsPath = path.join(__dirname, 'src', 'utils', 'security', 'securityUtils.ts');
        console.log('Utils file path:', utilsPath);

        const fs = require('fs');

        // Check if files exist and have content
        const configStats = fs.statSync(configPath);
        const utilsStats = fs.statSync(utilsPath);

        console.log('Security config file size:', configStats.size, 'bytes');
        console.log('Security utils file size:', utilsStats.size, 'bytes');

        if (configStats.size === 0) {
            console.error('ERROR: securityConfig.ts is empty!');
        }

        if (utilsStats.size === 0) {
            console.error('ERROR: securityUtils.ts is empty!');
        }

        console.log('File check completed successfully!');

    } catch (error) {
        console.error('Import test failed:', error);
    }
}

testImports();
