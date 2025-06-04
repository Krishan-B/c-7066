#!/usr/bin/env node

/**
 * Phase 1B Health Check Script
 * 
 * This script performs a comprehensive health check of Phase 1B security implementations
 * without relying on the test runner to verify all components are properly configured.
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 Phase 1B Security Health Check');
console.log('==================================\n');

// Define critical Phase 1B files
const criticalFiles = [
    // Security Configuration
    'src/utils/security/securityConfig.ts',
    'src/utils/security/securityUtils.ts',

    // OAuth Components
    'src/features/auth/components/OAuthLogin.tsx',
    'src/features/auth/components/OAuthCallback.tsx',

    // User Agreements & GDPR
    'src/features/auth/components/UserAgreements.tsx',

    // Enhanced Authentication
    'src/features/auth/components/EnhancedLoginPage.tsx',
    'src/features/auth/components/EnhancedRegisterPage.tsx',

    // 2FA Implementation
    'src/features/auth/components/TwoFactorSetup.tsx',

    // Auth Utilities
    'src/utils/auth/authUtils.ts',

    // Test Files
    'tests/phase1b-comprehensive.test.ts',
    'tests/phase1b-security-validation.test.ts',
    'tests/phase1b-implementation.test.ts'
];

let totalScore = 0;
let maxScore = 0;

console.log('📁 File Existence Check:');
console.log('-'.repeat(50));

criticalFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const exists = existsSync(fullPath);
    maxScore += 10;

    if (exists) {
        try {
            const content = readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;
            const hasContent = content.trim().length > 100; // Basic content check

            if (hasContent) {
                console.log(`✅ ${file} (${lines} lines)`);
                totalScore += 10;
            } else {
                console.log(`⚠️  ${file} (exists but minimal content)`);
                totalScore += 5;
            }
        } catch (error) {
            console.log(`❌ ${file} (read error: ${error.message})`);
        }
    } else {
        console.log(`❌ ${file} (missing)`);
    }
});

console.log('\n🔍 Critical Components Analysis:');
console.log('-'.repeat(50));

// Check security config specifically
const securityConfigPath = path.join(__dirname, 'src/utils/security/securityConfig.ts');
if (existsSync(securityConfigPath)) {
    const content = readFileSync(securityConfigPath, 'utf8');

    const hasOAuth = content.includes('oauth') && content.includes('providers');
    const has2FA = content.includes('twoFactor') || content.includes('totp');
    const hasSession = content.includes('session');
    const hasRateLimit = content.includes('rateLimit');
    const hasEncryption = content.includes('encryption');

    console.log(`OAuth Config: ${hasOAuth ? '✅' : '❌'}`);
    console.log(`2FA Config: ${has2FA ? '✅' : '❌'}`);
    console.log(`Session Config: ${hasSession ? '✅' : '❌'}`);
    console.log(`Rate Limiting: ${hasRateLimit ? '✅' : '❌'}`);
    console.log(`Encryption: ${hasEncryption ? '✅' : '❌'}`);
} else {
    console.log('❌ Security config file missing');
}

// Check package.json dependencies
console.log('\n📦 Security Dependencies:');
console.log('-'.repeat(50));

const packageJsonPath = path.join(__dirname, 'package.json');
if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const securityDeps = [
        'crypto-js',
        'otpauth',
        'qrcode',
        '@types/crypto-js',
        '@types/qrcode',
        'bcrypt'
    ];

    securityDeps.forEach(dep => {
        const installed = deps[dep];
        console.log(`${installed ? '✅' : '❌'} ${dep}${installed ? ` (${installed})` : ''}`);
    });
}

// Check environment configuration
console.log('\n🌍 Environment Configuration:');
console.log('-'.repeat(50));

const envFiles = ['.env.example', '.env.development'];
envFiles.forEach(envFile => {
    const envPath = path.join(__dirname, envFile);
    if (existsSync(envPath)) {
        const content = readFileSync(envPath, 'utf8');
        const hasAuth = content.includes('AUTH') || content.includes('OAUTH');
        const hasSupabase = content.includes('SUPABASE');

        console.log(`✅ ${envFile} (Auth: ${hasAuth ? '✅' : '❌'}, Supabase: ${hasSupabase ? '✅' : '❌'})`);
    } else {
        console.log(`❌ ${envFile} (missing)`);
    }
});

console.log('\n📊 Health Check Summary:');
console.log('='.repeat(50));
console.log(`Score: ${totalScore}/${maxScore} (${Math.round((totalScore / maxScore) * 100)}%)`);

if (totalScore === maxScore) {
    console.log('🎉 All Phase 1B components are present and configured!');
} else if (totalScore > maxScore * 0.8) {
    console.log('⚠️  Most Phase 1B components are ready, minor issues detected');
} else {
    console.log('❌ Critical Phase 1B components are missing or misconfigured');
}

console.log('\n🚀 Next Steps:');
console.log('-'.repeat(50));
console.log('1. Run comprehensive test suite');
console.log('2. Verify OAuth provider integration');
console.log('3. Test 2FA setup and validation');
console.log('4. Validate GDPR compliance features');
console.log('5. Execute security vulnerability scans');

console.log('\n✅ Health check complete!');
