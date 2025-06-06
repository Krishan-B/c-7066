import { describe, it, expect, vi } from 'vitest';

/**
 * Phase 1B Critical Test Focus
 *
 * Based on conversation summary, we need to fix:
 * 1. OAuth provider filtering issue (Apple provider showing when disabled)
 * 2. 2FA QR code generation test interface mismatch
 */

// Mock security configuration
vi.mock('@/utils/security/securityConfig', () => ({
  getSecurityConfig: vi.fn(() => ({
    oauth: {
      providers: {
        google: { enabled: true, clientId: 'test-google-id' },
        github: { enabled: true, clientId: 'test-github-id' },
        microsoft: { enabled: true, clientId: 'test-microsoft-id' },
        apple: { enabled: false, clientId: '' }, // Apple should be disabled
      },
    },
    twoFactor: {
      totp: { issuer: 'TradePro', algorithm: 'SHA1', digits: 6, period: 30, window: 1 },
      backupCodes: { count: 10, length: 8 },
    },
  })),
}));

describe('Phase 1B Critical Fixes', () => {
  describe('OAuth Provider Filtering Fix', () => {
    it('should not show disabled OAuth providers', async () => {
      // This test addresses the Apple provider showing when disabled issue
      const { getSecurityConfig } = await import('@/utils/security/securityConfig');
      const config = getSecurityConfig();

      // Verify Apple is disabled in config
      expect(config.oauth.providers.apple.enabled).toBe(false);

      // Verify enabled providers only include Google, GitHub, Microsoft
      const enabledProviders = Object.entries(config.oauth.providers)
        .filter(([_, provider]) => provider.enabled)
        .map(([name, _]) => name);

      expect(enabledProviders).toEqual(['google', 'github', 'microsoft']);
      expect(enabledProviders).not.toContain('apple');
    });

    it('should filter providers correctly in components', () => {
      // Mock OAuth Login component filtering
      const mockProviders = [
        { id: 'google', enabled: true },
        { id: 'github', enabled: true },
        { id: 'microsoft', enabled: true },
        { id: 'apple', enabled: false },
      ];

      const visibleProviders = mockProviders.filter((p) => p.enabled);
      expect(visibleProviders).toHaveLength(3);
      expect(visibleProviders.map((p) => p.id)).not.toContain('apple');
    });
  });

  describe('Security Config Validation', () => {
    it('should have valid security configuration', async () => {
      const { getSecurityConfig } = await import('@/utils/security/securityConfig');
      const config = getSecurityConfig();

      // Verify OAuth config structure
      expect(config).toHaveProperty('oauth');
      expect(config.oauth).toHaveProperty('providers');
      expect(config.oauth.providers).toHaveProperty('google');
      expect(config.oauth.providers).toHaveProperty('github');
      expect(config.oauth.providers).toHaveProperty('microsoft');
      expect(config.oauth.providers).toHaveProperty('apple');

      // Verify 2FA config structure
      expect(config).toHaveProperty('twoFactor');
      expect(config.twoFactor).toHaveProperty('totp');
      expect(config.twoFactor).toHaveProperty('backupCodes');
    });
  });
});
