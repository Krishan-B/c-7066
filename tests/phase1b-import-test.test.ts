// Test component imports for Phase 1B
import { describe, it, expect } from 'vitest';

describe('Phase 1B Component Import Tests', () => {
  it('should import components without errors', async () => {
    // Test basic component imports
    const OAuthLogin = await import(
      '../src/features/auth/components/OAuthLogin'
    );
    expect(OAuthLogin.default).toBeDefined();
    expect(typeof OAuthLogin.default).toBe('function');

    const OAuthCallback = await import(
      '../src/features/auth/components/OAuthCallback'
    );
    expect(OAuthCallback.default).toBeDefined();
    expect(typeof OAuthCallback.default).toBe('function');

    const UserAgreements = await import(
      '../src/features/auth/components/UserAgreements'
    );
    expect(UserAgreements.default).toBeDefined();
    expect(typeof UserAgreements.default).toBe('function');

    const TwoFactorSetup = await import(
      '../src/features/auth/components/TwoFactorSetup'
    );
    expect(TwoFactorSetup.default).toBeDefined();
    expect(typeof TwoFactorSetup.default).toBe('function');
  });

  it('should import utility modules without errors', async () => {
    const securityUtils = await import('../src/utils/security/securityUtils');
    expect(securityUtils).toBeDefined();
    expect(typeof securityUtils.generateSecureRandom).toBe('function');
    expect(typeof securityUtils.validatePasswordStrength).toBe('function');

    const authUtils = await import('../src/utils/auth/authUtils');
    expect(authUtils).toBeDefined();
    expect(typeof authUtils.initOAuthFlow).toBe('function');

    const securityConfig = await import('../src/utils/security/securityConfig');
    expect(securityConfig).toBeDefined();
    expect(typeof securityConfig.getSecurityConfig).toBe('function');
  });
});
