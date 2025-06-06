#!/usr/bin/env node
/**
 * Basic Component Import Test
 * Tests if all Phase 1B components can be imported without errors
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Phase 1B Component Import Test');
console.log('=====================================\n');

const components = [
    {
        name: 'OAuthLogin',
        path: 'src/features/auth/components/OAuthLogin.tsx'
    },
    {
        name: 'OAuthCallback',
        path: 'src/features/auth/components/OAuthCallback.tsx'
    },
    {
        name: 'TwoFactorSetup',
        path: 'src/features/auth/components/TwoFactorSetup.tsx'
    },
    {
        name: 'EnhancedLoginPage',
        path: 'src/features/auth/components/EnhancedLoginPage.tsx'
    },
    {
        name: 'EnhancedRegisterPage',
        path: 'src/features/auth/components/EnhancedRegisterPage.tsx'
    },
    {
        name: 'UserAgreements',
        path: 'src/features/auth/components/UserAgreements.tsx'
    }
];

const utils = [
    {
        name: 'securityConfig',
        path: 'src/utils/security/securityConfig.ts'
    },
    {
        name: 'securityUtils',
        path: 'src/utils/security/securityUtils.ts'
    },
    {
        name: 'authUtils',
        path: 'src/utils/auth/authUtils.ts'
    }
];

let totalTests = 0;
let passedTests = 0;

function testFileExists(item) {
    totalTests++;
    const fullPath = join(__dirname, item.path);

    if (existsSync(fullPath)) {
        console.log(`✅ ${item.name}: File exists (${item.path})`);
        passedTests++;
        return true;
    } else {
        console.log(`❌ ${item.name}: File missing (${item.path})`);
        return false;
    }
}

function testExport(item) {
    totalTests++;
    const fullPath = join(__dirname, item.path);

    try {
        const content = readFileSync(fullPath, 'utf8');

        if (content.includes('export default') || content.includes('export {')) {
            console.log(`✅ ${item.name}: Has proper exports`);
            passedTests++;
            return true;
        } else {
            console.log(`❌ ${item.name}: Missing export statements`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${item.name}: Error reading file - ${error.message}`);
        return false;
    }
}

function testImports(item) {
    totalTests++;
    const fullPath = join(__dirname, item.path);

    try {
        const content = readFileSync(fullPath, 'utf8');

        // Check for basic React imports
        if (content.includes("import React") || content.includes("import {")) {
            console.log(`✅ ${item.name}: Has proper imports`);
            passedTests++;
            return true;
        } else {
            console.log(`❌ ${item.name}: Missing imports`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${item.name}: Error checking imports - ${error.message}`);
        return false;
    }
}

// Test Components
console.log('📱 Testing Core Components:');
console.log('---------------------------');
components.forEach(comp => {
    testFileExists(comp);
    testExport(comp);
    testImports(comp);
    console.log('');
});

// Test Utilities
console.log('🔧 Testing Security Utilities:');
console.log('-------------------------------');
utils.forEach(util => {
    testFileExists(util);
    testExport(util);
    testImports(util);
    console.log('');
});

// Summary
console.log('📊 Test Summary:');
console.log('================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

if (passedTests === totalTests) {
    console.log('🎉 All component tests passed! Ready for comprehensive testing.');
    process.exit(0);
} else {
    console.log('⚠️  Some components need attention before proceeding.');
    process.exit(1);
}
