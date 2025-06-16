// Password Strength Hook Security Tests
// Tests for the usePasswordStrength hook to ensure secure password validation

import { renderHook } from '@testing-library/react';
import { usePasswordStrength } from '@/features/auth/hooks/usePasswordStrength';

describe('Password Strength Security Tests', () => {
  describe('Password Strength Calculation', () => {
    it('should enforce minimum security requirements', () => {
      const { result } = renderHook(() => usePasswordStrength('weak'));

      expect(result.current.score).toBeLessThan(60);
      expect(result.current.label).toBe('Weak');
      expect(result.current.meetsMinimumRequirements).toBe(false);
      expect(result.current.feedback).toContain('Use at least 8 characters');
    });

    it('should require all character types for strong passwords', () => {
      const testCases = [
        { password: 'lowercase123!', expectedStrength: 'Medium' }, // No uppercase
        { password: 'UPPERCASE123!', expectedStrength: 'Medium' }, // No lowercase
        { password: 'MixedCase123', expectedStrength: 'Medium' }, // No special
        { password: 'MixedCase!@#', expectedStrength: 'Medium' }, // No number
        { password: 'StrongPass123!', expectedStrength: 'Strong' }, // All types
      ];

      testCases.forEach(({ password, expectedStrength }) => {
        const { result } = renderHook(() => usePasswordStrength(password));
        expect(result.current.label).toBe(expectedStrength);
        if (expectedStrength === 'Strong') {
          expect(result.current.score).toBeGreaterThan(80);
          expect(result.current.meetsMinimumRequirements).toBe(true);
        }
      });
    });

    it('should reject common weak password patterns', () => {
      const weakPasswords = [
        'password123',
        '12345678',
        'qwertyui',
        'admin123',
        'Password',
        'letmein1',
        '11111111',
      ];

      weakPasswords.forEach((password) => {
        const { result } = renderHook(() => usePasswordStrength(password));
        expect(result.current.score).toBeLessThan(80);
        expect(result.current.label).not.toBe('Strong');
      });
    });

    it('should provide specific feedback for password improvements', () => {
      const testCases = [
        {
          password: 'short',
          expectedFeedback: [
            'Use at least 8 characters',
            'Add numbers',
            'Add uppercase letters',
            'Add special characters',
          ],
        },
        {
          password: 'toolongbutnospecialchars123',
          expectedFeedback: ['Add special characters'],
        },
        {
          password: 'NoNumbers!',
          expectedFeedback: ['Add numbers'],
        },
        {
          password: 'nonumbers!',
          expectedFeedback: ['Add numbers', 'Add uppercase letters'],
        },
      ];

      testCases.forEach(({ password, expectedFeedback }) => {
        const { result } = renderHook(() => usePasswordStrength(password));
        expectedFeedback.forEach((feedback) => {
          expect(result.current.feedback).toContain(feedback);
        });
      });
    });

    it('should handle edge cases securely', () => {
      const edgeCases = [
        { password: '', expectedScore: 0, expectedLabel: 'None' },
        { password: ' ', expectedScore: 0, expectedLabel: 'None' }, // single space, expect 0
        { password: null as any, expectedScore: 0, expectedLabel: 'None' },
        { password: undefined as any, expectedScore: 0, expectedLabel: 'None' },
      ];

      edgeCases.forEach(({ password, expectedScore, expectedLabel }) => {
        const { result } = renderHook(() => usePasswordStrength(password));
        expect(result.current.score).toBe(expectedScore);
        expect(result.current.label).toBe(expectedLabel);
        expect(result.current.meetsMinimumRequirements).toBe(false);
      });
    });

    it('should validate password length requirements', () => {
      const lengthTests = [
        { password: '1234567', length: 7, shouldMeetRequirements: false },
        { password: 'Abcd123!', length: 8, shouldMeetRequirements: true },
        { password: 'VeryLongPassword123!@#', length: 22, shouldMeetRequirements: true },
      ];

      lengthTests.forEach(({ password, shouldMeetRequirements }) => {
        const { result } = renderHook(() => usePasswordStrength(password));
        expect(result.current.meetsMinimumRequirements).toBe(shouldMeetRequirements);
        if (password.length < 8) {
          expect(result.current.feedback).toContain('Use at least 8 characters');
        }
      });
    });

    it('should calculate strength scores consistently', () => {
      const password = 'TestPassword123!';
      const { result: result1 } = renderHook(() => usePasswordStrength(password));
      const { result: result2 } = renderHook(() => usePasswordStrength(password));

      expect(result1.current.score).toBe(result2.current.score);
      expect(result1.current.label).toBe(result2.current.label);
      expect(result1.current.color).toBe(result2.current.color);
    });

    it('should ensure backward compatibility methods work', () => {
      const { result } = renderHook(() => usePasswordStrength('StrongPass123!'));

      expect(result.current.getPasswordStrengthLabel()).toBe(result.current.label);
      expect(result.current.getPasswordStrengthColor()).toBe(result.current.color);
      expect(typeof result.current.getPasswordStrengthLabel).toBe('function');
      expect(typeof result.current.getPasswordStrengthColor).toBe('function');
    });

    it('should prevent timing attacks through consistent processing', () => {
      const passwords = ['a', 'VeryLongComplexPassword123!@#$%^&*()', 'Medium123!', ''];

      const timings: number[] = [];

      passwords.forEach((password) => {
        const start = performance.now();
        renderHook(() => usePasswordStrength(password));
        const end = performance.now();
        timings.push(end - start);
      });

      // Check that processing times don't vary dramatically
      const maxTiming = Math.max(...timings);
      const minTiming = Math.min(...timings);

      // Allow for more variation in CI/dev environments
      expect(maxTiming / minTiming).toBeLessThanOrEqual(20);
    });

    it('should handle special character validation correctly', () => {
      const specialCharTests = [
        { password: 'TestPass123!', hasSpecial: true },
        { password: 'TestPass123@', hasSpecial: true },
        { password: 'TestPass123#', hasSpecial: true },
        { password: 'TestPass123$', hasSpecial: true },
        { password: 'TestPass123%', hasSpecial: true },
        { password: 'TestPass123^', hasSpecial: true },
        { password: 'TestPass123&', hasSpecial: true },
        { password: 'TestPass123*', hasSpecial: true },
        { password: 'TestPass123(', hasSpecial: true },
        { password: 'TestPass123)', hasSpecial: true },
        { password: 'TestPass123-', hasSpecial: true },
        { password: 'TestPass123_', hasSpecial: true },
        { password: 'TestPass123+', hasSpecial: true },
        { password: 'TestPass123=', hasSpecial: true },
        { password: 'TestPass123[', hasSpecial: true },
        { password: 'TestPass123]', hasSpecial: true },
        { password: 'TestPass123{', hasSpecial: true },
        { password: 'TestPass123}', hasSpecial: true },
        { password: 'TestPass123|', hasSpecial: true },
        { password: 'TestPass123\\', hasSpecial: true },
        { password: 'TestPass123;', hasSpecial: true },
        { password: 'TestPass123:', hasSpecial: true },
        { password: 'TestPass123"', hasSpecial: true },
        { password: "TestPass123'", hasSpecial: true },
        { password: 'TestPass123<', hasSpecial: true },
        { password: 'TestPass123>', hasSpecial: true },
        { password: 'TestPass123,', hasSpecial: true },
        { password: 'TestPass123.', hasSpecial: true },
        { password: 'TestPass123?', hasSpecial: true },
        { password: 'TestPass123/', hasSpecial: true },
        { password: 'TestPass123', hasSpecial: false },
      ];

      specialCharTests.forEach(({ password, hasSpecial }) => {
        const { result } = renderHook(() => usePasswordStrength(password));

        if (hasSpecial) {
          expect(result.current.feedback).not.toContain('Add special characters');
        } else {
          expect(result.current.feedback).toContain('Add special characters');
        }
      });
    });
  });

  describe('Security Properties', () => {
    it('should not expose sensitive information in feedback', () => {
      const { result } = renderHook(() => usePasswordStrength('password123'));

      // Ensure feedback doesn't contain actual password
      result.current.feedback.forEach((feedback) => {
        expect(feedback).not.toContain('password123');
      });

      // Ensure feedback is generic and helpful
      expect(result.current.feedback).toEqual(
        expect.arrayContaining([expect.stringMatching(/^(Add|Use)/)])
      );
    });

    it('should maintain consistent API surface', () => {
      const { result } = renderHook(() => usePasswordStrength('Test123!'));

      expect(result.current).toHaveProperty('score');
      expect(result.current).toHaveProperty('label');
      expect(result.current).toHaveProperty('color');
      expect(result.current).toHaveProperty('feedback');
      expect(result.current).toHaveProperty('meetsMinimumRequirements');
      expect(result.current).toHaveProperty('getPasswordStrengthLabel');
      expect(result.current).toHaveProperty('getPasswordStrengthColor');

      expect(typeof result.current.score).toBe('number');
      expect(typeof result.current.label).toBe('string');
      expect(typeof result.current.color).toBe('string');
      expect(Array.isArray(result.current.feedback)).toBe(true);
      expect(typeof result.current.meetsMinimumRequirements).toBe('boolean');
      expect(typeof result.current.getPasswordStrengthLabel).toBe('function');
      expect(typeof result.current.getPasswordStrengthColor).toBe('function');
    });

    it('should enforce minimum requirements correctly', () => {
      const testCases = [
        { password: 'Abc123!@', meetsMin: true }, // 8 chars, all types
        { password: 'Abc123!', meetsMin: false }, // 7 chars, should be false
        { password: 'abcd123!', meetsMin: true }, // 8 chars, no uppercase but has special
        { password: 'ABCD123!', meetsMin: false }, // 8 chars, no lowercase, should be false
        { password: 'Abcdefgh', meetsMin: false }, // 8 chars but no numbers or special
        { password: 'Abc123', meetsMin: false }, // 6 chars, missing special
        { password: '12345678', meetsMin: false }, // 8 chars but only numbers
        { password: '        ', meetsMin: false }, // 8 spaces, whitespace-only, should be false
      ];

      testCases.forEach(({ password, meetsMin }) => {
        const { result } = renderHook(() => usePasswordStrength(password));
        expect(result.current.meetsMinimumRequirements).toBe(meetsMin);
      });
    });
  });
});
