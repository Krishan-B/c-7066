// Security Test Setup
// Global setup and configuration for security testing

import { jest } from '@jest/globals';
import { config } from 'dotenv';
import type { MaliciousPayloads } from './global'; // Import the interface

/// <reference path="./global.d.ts" />

// Load test environment variables
config({ path: '.env.test' });

// Global test configuration
beforeAll(async () => {
  // Set up test environment
  process.env.NODE_ENV = 'test';
  process.env.SECURITY_TEST_MODE = 'true';

  // Disable actual external API calls during security testing
  process.env.DISABLE_EXTERNAL_APIS = 'true';

  // Use test database
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || 'test://localhost';

  // Set secure test configurations
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-security-testing';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';

  console.log('🔒 Security test environment initialized');
});

afterAll(async () => {
  // Clean up after all tests
  console.log('🧹 Security test cleanup completed');
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();

  // Reset console spies
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore all mocks after each test
  jest.restoreAllMocks();
});

// Global security test utilities
// Explicitly type global assignments according to global.d.ts
(global as NodeJS.Global & typeof globalThis).securityTestUtils = {
  // Common test data
  testUsers: {
    valid: {
      email: 'test@example.com',
      password: 'ValidPassword123!',
      id: 'user-123',
    },
    admin: {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      id: 'admin-456',
      role: 'admin',
    },
    locked: {
      email: 'locked@example.com',
      password: 'LockedPassword123!',
      id: 'locked-789',
      status: 'locked',
    },
  },

  // Security event types
  securityEventTypes: {
    AUTH_FAILURE: 'auth_failure',
    AUTH_SUCCESS: 'auth_success',
    PASSWORD_CHANGE: 'password_change',
    ACCOUNT_LOCKED: 'account_locked',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    API_KEY_COMPROMISED: 'api_key_compromised',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  },

  // Common security headers for testing
  securityHeaders: {
    'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
    'content-security-policy': "default-src 'self'; script-src 'self'",
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'referrer-policy': 'strict-origin-when-cross-origin',
  },

  // Security test helpers
  generateSecurePassword: (length = 12): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },

  generateInsecurePassword: (): string => {
    const insecurePasswords: string[] = [
      'password',
      '123456',
      'qwerty',
      'admin',
      'letmein',
      '12345678',
      'welcome',
      'monkey',
    ];
    return insecurePasswords[Math.floor(Math.random() * insecurePasswords.length)];
  },

  generateMaliciousInput: (type: 'sql' | 'xss' | 'nosql' | 'ldap' = 'sql'): string => {
    const payloads: MaliciousPayloads = {
      sql: ["'; DROP TABLE users; --", "' OR '1'='1", "admin'--"],
      xss: [
        "<script>alert('XSS')</script>",
        "javascript:alert('XSS')",
        "<img src=x onerror=alert('XSS')>",
      ],
      nosql: ['{ $ne: null }', "{ $gt: '' }", "{ $where: 'function() { return true; }' }"],
      ldap: ['*)(uid=*', '*)(|(uid=*', 'admin)(&(|(uid=*'],
    };

    const typePayloads: string[] = payloads[type] || payloads.sql;
    return typePayloads[Math.floor(Math.random() * typePayloads.length)];
  },

  createMockRequest: (overrides: Record<string, any> = {}): Record<string, any> => ({
    method: 'POST',
    url: '/api/test',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (Test Browser)',
      ...(overrides.headers || {}),
    },
    body: overrides.body || {},
    ip: overrides.ip || '192.168.1.100',
    ...overrides,
  }),

  createMockResponse: (): Record<string, any> => {
    const res: Record<string, any> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.header = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.getHeader = jest.fn();
    res.headers = {}; // Initialize headers object
    return res;
  },

  // Security assertion helpers
  assertSecureHeaders: (headers: Record<string, string | string[] | undefined>): void => {
    expect(headers['strict-transport-security']).toBeDefined();
    expect(headers['content-security-policy']).toBeDefined();
    expect(headers['x-frame-options']).toBeDefined();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBeDefined();
  },

  assertNoSensitiveData: (response: any): void => {
    const responseStr = JSON.stringify(response);
    const sensitivePatterns: RegExp[] = [
      /password/i,
      /secret/i,
      /private[_-]?key/i,
      /api[_-]?key/i,
      /token/i,
      /jwt/i,
    ];

    sensitivePatterns.forEach((pattern) => {
      expect(responseStr).not.toMatch(pattern);
    });
  },

  assertRateLimitHeaders: (headers: Record<string, string | string[] | undefined>): void => {
    expect(headers['x-ratelimit-limit']).toBeDefined();
    expect(headers['x-ratelimit-remaining']).toBeDefined();
    expect(headers['x-ratelimit-reset']).toBeDefined();
  },
};

// Security-specific Jest matchers
expect.extend({
  toHaveSecurityHeaders(received: Record<string, any>) {
    const requiredHeaders: string[] = [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
    ];

    const missingHeaders: string[] = requiredHeaders.filter((header) => !received[header]);

    if (missingHeaders.length === 0) {
      return {
        message: () => 'Expected headers to not have all required security headers',
        pass: true,
      };
    } else {
      return {
        message: () => `Missing security headers: ${missingHeaders.join(', ')}`,
        pass: false,
      };
    }
  },

  toBeSecurePassword(received: string) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(received);
    const hasLowercase = /[a-z]/.test(received);
    const hasNumbers = /\d/.test(received);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(received);

    const isSecure: boolean =
      received.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;

    if (isSecure) {
      return {
        message: () => 'Expected password to not be secure',
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Password does not meet security requirements: minimum ${minLength} characters, uppercase, lowercase, numbers, and special characters`,
        pass: false,
      };
    }
  },

  toHaveValidJWT(received: string) {
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;

    if (jwtPattern.test(received)) {
      return {
        message: () => 'Expected string to not be a valid JWT format',
        pass: true,
      };
    } else {
      return {
        message: () => 'Expected string to be a valid JWT format (header.payload.signature)',
        pass: false,
      };
    }
  },
});

// Console output helpers for security testing
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

(global as NodeJS.Global & typeof globalThis).enableConsoleOutput = () => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
};

(global as NodeJS.Global & typeof globalThis).disableConsoleOutput = () => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
};

// Security test performance monitoring
const performanceStartTimes = new Map<string, number>();

(global as NodeJS.Global & typeof globalThis).startSecurityPerformanceTest = (
  testName: string
): void => {
  performanceStartTimes.set(testName, Date.now());
};

(global as NodeJS.Global & typeof globalThis).endSecurityPerformanceTest = (
  testName: string,
  maxDurationMs = 1000
): number | undefined => {
  const startTime = performanceStartTimes.get(testName);
  if (!startTime) {
    throw new Error(`Performance test "${testName}" was not started`);
  }

  const duration = Date.now() - startTime;
  performanceStartTimes.delete(testName);

  if (duration > maxDurationMs) {
    throw new Error(
      `Security test "${testName}" took ${duration}ms, exceeding maximum of ${maxDurationMs}ms`
    );
  }

  return duration;
};

console.log('🔒 Security test setup completed');
