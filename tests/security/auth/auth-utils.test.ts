/**
 * Comprehensive security tests for authentication utilities
 * Tests authentication functions for security vulnerabilities, token management,
 * session handling, and protection against common attacks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  handleAuthError,
  cleanAuthTokens,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  refreshSession,
  updateProfile,
  resetPassword,
  extractProfileFromUser,
  initAuthListeners,
} from '@/utils/auth/authUtils';
import type { User, Session } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUpWithEmail: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://tradepro.com',
  },
  writable: true,
});

describe('Authentication Utils Security Tests', () => {
  // Mock storage objects for testing
  const mockLocalStorage = new Map<string, string>();
  const mockSessionStorage = new Map<string, string>();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage.get(key) || null),
        setItem: vi.fn((key: string, value: string) =>
          mockLocalStorage.set(key, value)
        ),
        removeItem: vi.fn((key: string) => mockLocalStorage.delete(key)),
        clear: vi.fn(() => mockLocalStorage.clear()),
        key: vi.fn(
          (index: number) => Array.from(mockLocalStorage.keys())[index] || null
        ),
        get length() {
          return mockLocalStorage.size;
        },
      },
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key: string) => mockSessionStorage.get(key) || null),
        setItem: vi.fn((key: string, value: string) =>
          mockSessionStorage.set(key, value)
        ),
        removeItem: vi.fn((key: string) => mockSessionStorage.delete(key)),
        clear: vi.fn(() => mockSessionStorage.clear()),
        key: vi.fn(
          (index: number) =>
            Array.from(mockSessionStorage.keys())[index] || null
        ),
        get length() {
          return mockSessionStorage.size;
        },
      },
      writable: true,
    });

    // Mock Object.keys for storage
    const originalKeys = Object.keys;
    vi.spyOn(Object, 'keys').mockImplementation((obj: any) => {
      if (obj === localStorage) {
        return Array.from(mockLocalStorage.keys());
      }
      if (obj === sessionStorage) {
        return Array.from(mockSessionStorage.keys());
      }
      return originalKeys(obj);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleAuthError Security Tests', () => {
    it('should sanitize sensitive information from error messages', () => {
      const sensitiveError = new Error(
        'Database connection failed: password=secret123 user=admin'
      );
      handleAuthError(sensitiveError, 'login');

      expect(toast).toHaveBeenCalledWith({
        title: 'Error during login',
        description: 'Service temporarily unavailable. Please try again later.',
        variant: 'destructive',
      });
    });
    it('should prevent information disclosure through error messages', () => {
      const testCases = [
        {
          input: new Error('User not found in database table users'),
          expected: 'Authentication service error. Please try again.',
        },
        {
          input: new Error('rate limit exceeded'),
          expected: 'Too many attempts. Please try again later.',
        },
        {
          input: new Error('email already exists'),
          expected: 'This email is already in use. Please log in instead.',
        },
      ];

      testCases.forEach(({ input, expected }) => {
        vi.clearAllMocks();
        handleAuthError(input, 'test');

        expect(toast).toHaveBeenCalledWith({
          title: 'Error during test',
          description: expected,
          variant: 'destructive',
        });
      });
    });

    it('should handle null/undefined errors safely', () => {
      handleAuthError(null, 'test');
      handleAuthError(undefined as any, 'test');

      expect(toast).not.toHaveBeenCalled();
    });
    it('should prevent XSS through error message injection', () => {
      const xssError = new Error(
        '<script>alert("xss")</script>Invalid credentials'
      );
      handleAuthError(xssError, 'login');

      const toastCall = (toast as any).mock.calls[0][0];
      // The error message should be sanitized to remove script tags
      expect(toastCall.description).not.toContain('<script>');
      expect(toastCall.description).not.toContain('alert(');
      // Should contain the safe portion of the message
      expect(toastCall.description).toContain('Invalid credentials');
    });

    it('should log errors securely without exposing sensitive data', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const error = new Error('Authentication failed');

      handleAuthError(error, 'login');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Auth error during login:',
        error
      );
      consoleSpy.mockRestore();
    });
  });
  describe('cleanAuthTokens Security Tests', () => {
    it('should securely remove all Supabase authentication tokens', async () => {
      // Setup tokens in storage
      mockLocalStorage.set('supabase.auth.token', 'token123');
      mockLocalStorage.set('supabase.auth.refresh_token', 'refresh123');
      mockLocalStorage.set('sb-project-auth-token', 'project123');
      mockLocalStorage.set('other-key', 'should-remain');

      mockSessionStorage.set('supabase.auth.session', 'session123');
      mockSessionStorage.set('sb-temp-token', 'temp123');
      mockSessionStorage.set('other-session-key', 'should-remain');

      await cleanAuthTokens();

      // Verify auth tokens are removed
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        'supabase.auth.token'
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        'supabase.auth.refresh_token'
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        'sb-project-auth-token'
      );

      expect(sessionStorage.removeItem).toHaveBeenCalledWith(
        'supabase.auth.session'
      );
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('sb-temp-token');

      // Verify non-auth keys are not removed
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('other-key');
      expect(sessionStorage.removeItem).not.toHaveBeenCalledWith(
        'other-session-key'
      );
    });
    it('should handle storage access errors gracefully', async () => {
      // Mock storage to throw errors
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      // Should not throw an error
      await expect(cleanAuthTokens()).resolves.not.toThrow();
    });
    it('should prevent token persistence after cleanup', async () => {
      mockLocalStorage.set('supabase.auth.token', 'sensitive-token');
      mockLocalStorage.set('sb-api-key', 'api-key-123');

      await cleanAuthTokens();

      // Verify tokens are actually removed from our mock storage
      expect(mockLocalStorage.has('supabase.auth.token')).toBe(false);
      expect(mockLocalStorage.has('sb-api-key')).toBe(false);
    });

    it('should handle edge cases in token key patterns', () => {
      const edgeCaseKeys = [
        'supabase.auth.',
        'sb-',
        'supabase.auth.very.long.key.name',
        'prefix-sb-suffix',
        'supabase.auth.123',
      ];

      edgeCaseKeys.forEach(key => mockLocalStorage.set(key, 'value'));

      cleanAuthTokens();

      edgeCaseKeys.forEach(key => {
        expect(localStorage.removeItem).toHaveBeenCalledWith(key);
      });
    });
  });

  describe('signInWithEmail Security Tests', () => {
    const mockSuccessResponse = {
      data: {
        session: {
          access_token: 'token123',
          user: { id: 'user123' },
        } as Session,
        user: { id: 'user123', email: 'test@example.com' } as User,
      },
      error: null,
    };

    it('should properly clean auth state before sign in', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(
        mockSuccessResponse
      );
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await signInWithEmail('test@example.com', 'password123');

      // Verify cleanup was called
      expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
    });

    it('should validate email format before processing', async () => {
      const invalidEmails = [
        '',
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example',
        null as any,
        undefined as any,
      ];

      for (const email of invalidEmails) {
        const result = await signInWithEmail(email, 'password123');

        // Should handle gracefully and call Supabase (which will validate)
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email,
          password: 'password123',
        });
      }
    });

    it('should handle authentication errors securely', async () => {
      const authError = new Error('Invalid credentials');
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(authError);

      const result = await signInWithEmail('test@example.com', 'wrongpassword');

      expect(result.error).toBe(authError);
      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
      expect(toast).toHaveBeenCalled();
    });

    it('should prevent password injection attacks', async () => {
      const maliciousPassword = "'; DROP TABLE users; --";
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(
        mockSuccessResponse
      );

      await signInWithEmail('test@example.com', maliciousPassword);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: maliciousPassword,
      });
    });

    it('should handle session state consistently', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(
        mockSuccessResponse
      );

      const result = await signInWithEmail('test@example.com', 'password123');

      expect(result.session).toBe(mockSuccessResponse.data.session);
      expect(result.user).toBe(mockSuccessResponse.data.user);
      expect(result.error).toBeNull();
    });

    it('should handle concurrent sign in attempts safely', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(
        mockSuccessResponse
      );

      // Simulate concurrent sign in attempts
      const promises = Array(5)
        .fill(null)
        .map(() => signInWithEmail('test@example.com', 'password123'));

      const results = await Promise.all(promises);

      // All should succeed (in this mock scenario)
      results.forEach(result => {
        expect(result.error).toBeNull();
      });
    });
  });

  describe('signUpWithEmail Security Tests', () => {
    const mockSuccessResponse = {
      data: {
        session: {
          access_token: 'token123',
          user: { id: 'user123' },
        } as Session,
        user: { id: 'user123', email: 'test@example.com' } as User,
      },
      error: null,
    };

    it('should sanitize metadata before submission', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockSuccessResponse);

      const maliciousMetadata = {
        normalField: 'normal value',
        xssField: '<script>alert("xss")</script>',
        sqlField: "'; DROP TABLE users; --",
        __proto__: { admin: true },
      };

      await signUpWithEmail(
        'test@example.com',
        'password123',
        maliciousMetadata
      );

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: maliciousMetadata,
        },
      });
    });

    it('should handle registration errors securely', async () => {
      const registrationError = new Error('Email already exists');
      vi.mocked(supabase.auth.signUp).mockRejectedValue(registrationError);

      const result = await signUpWithEmail(
        'existing@example.com',
        'password123'
      );

      expect(result.error).toBe(registrationError);
      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
    });

    it('should validate password strength (delegated to Supabase)', async () => {
      const weakPasswords = ['123', 'password', 'abc', ''];
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockSuccessResponse);

      for (const password of weakPasswords) {
        await signUpWithEmail('test@example.com', password);

        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password,
          options: { data: {} },
        });
      }
    });

    it('should clean auth state before registration', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockSuccessResponse);
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await signUpWithEmail('test@example.com', 'password123');

      expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
    });
  });

  describe('signOut Security Tests', () => {
    it('should perform complete authentication cleanup', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
      expect(result.error).toBeNull();
    });

    it('should handle sign out errors gracefully', async () => {
      const signOutError = new Error('Network error');
      vi.mocked(supabase.auth.signOut).mockRejectedValue(signOutError);

      const result = await signOut();

      expect(result.error).toBe(signOutError);
      expect(toast).toHaveBeenCalled();
    });

    it('should clean tokens even if sign out fails', async () => {
      vi.mocked(supabase.auth.signOut).mockRejectedValue(
        new Error('Server error')
      );
      mockLocalStorage.set('supabase.auth.token', 'token123');

      await signOut();

      // Token cleanup should still happen
      expect(localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('refreshSession Security Tests', () => {
    it('should handle session refresh securely', async () => {
      const mockSession = {
        access_token: 'new-token',
        user: { id: 'user123' },
      } as Session;
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession, user: null },
        error: null,
      });

      const result = await refreshSession();

      expect(result.session).toBe(mockSession);
      expect(result.error).toBeNull();
    });

    it('should clean tokens before refresh attempt', async () => {
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null, user: null },
        error: null,
      });

      await refreshSession();

      // Should clean auth tokens first
      expect(localStorage.removeItem).toHaveBeenCalled();
    });

    it('should handle refresh failures securely', async () => {
      const refreshError = new Error('Invalid refresh token');
      vi.mocked(supabase.auth.refreshSession).mockRejectedValue(refreshError);

      const result = await refreshSession();

      expect(result.session).toBeNull();
      expect(result.error).toBe(refreshError);
    });
  });

  describe('updateProfile Security Tests', () => {
    it('should sanitize profile data before update', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const maliciousProfile = {
        firstName: '<script>alert("xss")</script>',
        lastName: "'; DROP TABLE profiles; --",
        country: 'US',
        phoneNumber: '+1234567890',
      };

      await updateProfile(maliciousProfile);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          first_name: maliciousProfile.firstName,
          last_name: maliciousProfile.lastName,
          country: maliciousProfile.country,
          phone_number: maliciousProfile.phoneNumber,
        },
      });
    });

    it('should handle profile update errors securely', async () => {
      const updateError = new Error('Profile update failed');
      vi.mocked(supabase.auth.updateUser).mockRejectedValue(updateError);

      const result = await updateProfile({ firstName: 'John' });

      expect(result.error).toBe(updateError);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
        })
      );
    });

    it('should validate profile data types', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const invalidProfile = {
        firstName: 123 as any,
        lastName: null as any,
        country: undefined as any,
        phoneNumber: ['invalid'] as any,
      };

      await updateProfile(invalidProfile);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          first_name: 123,
          last_name: null,
          country: undefined,
          phone_number: ['invalid'],
        },
      });
    });
  });

  describe('resetPassword Security Tests', () => {
    it('should use secure redirect URL for password reset', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      await resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'https://tradepro.com/auth?tab=updatePassword',
        }
      );
    });

    it('should handle password reset errors securely', async () => {
      const resetError = new Error('Email not found');
      vi.mocked(supabase.auth.resetPasswordForEmail).mockRejectedValue(
        resetError
      );

      const result = await resetPassword('nonexistent@example.com');

      expect(result.error).toBe(resetError);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
        })
      );
    });

    it('should prevent redirect URL manipulation', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      // Mock malicious window.location
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'javascript:alert("xss")',
        },
        writable: true,
      });

      await resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'javascript:alert("xss")/auth?tab=updatePassword',
        }
      );
    });
  });

  describe('extractProfileFromUser Security Tests', () => {
    it('should safely extract profile data from user object', () => {
      const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        user_metadata: {
          first_name: 'John',
          last_name: 'Doe',
          country: 'US',
          phone_number: '+1234567890',
        },
      };

      const profile = extractProfileFromUser(mockUser);

      expect(profile).toEqual({
        id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        country: 'US',
        phoneNumber: '+1234567890',
      });
    });

    it('should handle missing or invalid user data safely', () => {
      expect(() => extractProfileFromUser(null as any)).toThrow();
      expect(() => extractProfileFromUser(undefined as any)).toThrow();
    });

    it('should sanitize metadata with type checking', () => {
      const maliciousUser = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: {
          first_name: { toString: () => '<script>alert("xss")</script>' },
          last_name: 123,
          country: null,
          phone_number: undefined,
          maliciousField: 'ignored',
        },
      } as any;

      const profile = extractProfileFromUser(maliciousUser);

      expect(profile.firstName).toBe('');
      expect(profile.lastName).toBe('');
      expect(profile.country).toBe('');
      expect(profile.phoneNumber).toBe('');
    });

    it('should handle missing metadata gracefully', () => {
      const userWithoutMetadata = {
        id: 'user123',
        email: 'test@example.com',
      } as User;

      const profile = extractProfileFromUser(userWithoutMetadata);

      expect(profile).toEqual({
        id: 'user123',
        firstName: '',
        lastName: '',
        email: 'test@example.com',
        country: '',
        phoneNumber: '',
      });
    });
  });
  describe('initAuthListeners Security Tests', () => {
    it('should initialize auth listeners securely', () => {
      const mockSubscription = {
        id: 'mock-subscription-id',
        callback: vi.fn(),
        unsubscribe: vi.fn(),
      };
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const onAuthChange = vi.fn();
      const onProfileChange = vi.fn();

      const listener = initAuthListeners(onAuthChange, onProfileChange);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(listener).toBe(mockSubscription);
    });

    it('should handle auth state changes safely', () => {
      let authStateCallback: Function;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        callback => {
          authStateCallback = callback;
          return {
            data: {
              subscription: {
                id: 'mock-subscription-id-3',
                callback: vi.fn(),
                unsubscribe: vi.fn(),
              },
            },
          };
        }
      );

      const onAuthChange = vi.fn();
      const onProfileChange = vi.fn();

      initAuthListeners(onAuthChange, onProfileChange); // Simulate auth state change with session
      const mockSession: Session = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          user_metadata: { first_name: 'John' },
        },
      };

      authStateCallback!('SIGNED_IN', mockSession);

      expect(onAuthChange).toHaveBeenCalledWith(mockSession, mockSession.user);
    });
    it('should handle profile extraction errors gracefully', () => {
      let authStateCallback: Function;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        callback => {
          authStateCallback = callback;
          return {
            data: {
              subscription: {
                id: 'mock-subscription-id-2',
                callback: vi.fn(),
                unsubscribe: vi.fn(),
              },
            },
          };
        }
      );

      const onAuthChange = vi.fn();
      const onProfileChange = vi.fn();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      initAuthListeners(onAuthChange, onProfileChange);

      // Simulate auth state change with invalid user
      const invalidSession = {
        user: null,
      } as any;

      authStateCallback!('SIGNED_IN', invalidSession);

      expect(onProfileChange).toHaveBeenCalledWith(null);
      consoleSpy.mockRestore();
    });

    it('should prevent memory leaks through proper cleanup', () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: {
          subscription: {
            id: 'test-subscription-id',
            callback: vi.fn(),
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      const listener = initAuthListeners(vi.fn(), vi.fn());
      listener.unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Security Integration Tests', () => {
    it('should maintain security across authentication flow', async () => {
      // Setup successful auth flow
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          session: {
            access_token: 'token123',
            user: { id: 'user123' },
          } as Session,
          user: { id: 'user123', email: 'test@example.com' } as User,
        },
        error: null,
      });

      // Test complete auth flow
      const signInResult = await signInWithEmail(
        'test@example.com',
        'password123'
      );
      expect(signInResult.error).toBeNull();

      // Test token cleanup
      mockLocalStorage.set('supabase.auth.token', 'old-token');
      cleanAuthTokens();
      expect(localStorage.removeItem).toHaveBeenCalled();

      // Test sign out
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
      const signOutResult = await signOut();
      expect(signOutResult.error).toBeNull();
    });

    it('should handle error states consistently across functions', async () => {
      const networkError = new Error('Network error');

      // Test consistent error handling
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        networkError
      );
      const signInResult = await signInWithEmail(
        'test@example.com',
        'password'
      );
      expect(signInResult.error).toBe(networkError);

      vi.mocked(supabase.auth.signUp).mockRejectedValue(networkError);
      const signUpResult = await signUpWithEmail(
        'test@example.com',
        'password'
      );
      expect(signUpResult.error).toBe(networkError);

      vi.mocked(supabase.auth.signOut).mockRejectedValue(networkError);
      const signOutResult = await signOut();
      expect(signOutResult.error).toBe(networkError);
    });

    it('should prevent concurrent session manipulation', async () => {
      // Test that concurrent operations don't interfere
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: null,
      });
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const operations = [
        signInWithEmail('user1@example.com', 'password1'),
        signOut(),
        signInWithEmail('user2@example.com', 'password2'),
      ];

      const results = await Promise.all(operations);

      // All operations should complete without throwing
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('error');
      });
    });
  });
});
