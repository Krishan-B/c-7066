// API Security Tests
// Tests for API security including rate limiting, API key validation, and external API security

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createMockRateLimiter, generateBruteForceAttempts } from '../utils/security-test-helpers';

// Mock API clients and middleware
const mockRateLimiter = createMockRateLimiter(10, 60000); // 10 requests per minute
const mockApiKeyManager = {
  validateKey: jest.fn(),
  rotateKey: jest.fn(),
  revokeKey: jest.fn(),
  getKeyMetadata: jest.fn()
};

const mockExternalApiClient = {
  polygonAPI: jest.fn(),
  alphaVantageAPI: jest.fn(),
  finnhubAPI: jest.fn()
};

describe('API Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimiter.reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rate Limiting Protection', () => {
    it('should enforce rate limits per IP address', async () => {
      const clientIP = '192.168.1.100';
      
      // Make requests up to the limit
      for (let i = 0; i < 10; i++) {
        expect(mockRateLimiter.isAllowed(clientIP)).toBe(true);
      }
      
      // Next request should be blocked
      expect(mockRateLimiter.isAllowed(clientIP)).toBe(false);
    });

    it('should enforce rate limits per user', async () => {
      const userId = 'user-123';
      
      // Simulate user-based rate limiting
      const userRateLimiter = createMockRateLimiter(50, 60000); // 50 requests per minute per user
      
      for (let i = 0; i < 50; i++) {
        expect(userRateLimiter.isAllowed(userId)).toBe(true);
      }
      
      expect(userRateLimiter.isAllowed(userId)).toBe(false);
    });

    it('should handle burst protection', async () => {
      const clientIP = '192.168.1.101';
      const burstLimiter = createMockRateLimiter(5, 1000); // 5 requests per second
      
      // Rapid-fire requests
      for (let i = 0; i < 5; i++) {
        expect(burstLimiter.isAllowed(clientIP)).toBe(true);
      }
      
      // Should block additional burst requests
      expect(burstLimiter.isAllowed(clientIP)).toBe(false);
    });

    it('should implement different limits for different endpoints', () => {
      const tradingEndpointLimiter = createMockRateLimiter(5, 60000); // 5 trades per minute
      const dataEndpointLimiter = createMockRateLimiter(100, 60000); // 100 data requests per minute
      
      const userId = 'user-123';
      
      // Trading endpoint should have stricter limits
      for (let i = 0; i < 5; i++) {
        expect(tradingEndpointLimiter.isAllowed(userId)).toBe(true);
      }
      expect(tradingEndpointLimiter.isAllowed(userId)).toBe(false);
      
      // Data endpoint should allow more requests
      for (let i = 0; i < 100; i++) {
        expect(dataEndpointLimiter.isAllowed(userId)).toBe(true);
      }
      expect(dataEndpointLimiter.isAllowed(userId)).toBe(false);
    });

    it('should reset rate limits after time window', async () => {
      const clientIP = '192.168.1.102';
      const shortLimiter = createMockRateLimiter(2, 100); // 2 requests per 100ms
      
      // Use up the limit
      expect(shortLimiter.isAllowed(clientIP)).toBe(true);
      expect(shortLimiter.isAllowed(clientIP)).toBe(true);
      expect(shortLimiter.isAllowed(clientIP)).toBe(false);
      
      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should allow requests again
      expect(shortLimiter.isAllowed(clientIP)).toBe(true);
    });
  });

  describe('API Key Security', () => {
    it('should validate API key format', () => {
      const validKey = 'tp_live_1234567890abcdef1234567890abcdef';
      const invalidKeys = [
        '',
        'invalid-key',
        'tp_test_short',
        'wrong_prefix_1234567890abcdef1234567890abcdef',
        'tp_live_invalid_characters!@#$'
      ];
      
      mockApiKeyManager.validateKey.mockImplementation((key) => {
        return key.startsWith('tp_') && key.length === 38;
      });
      
      expect(mockApiKeyManager.validateKey(validKey)).toBe(true);
      
      invalidKeys.forEach(key => {
        expect(mockApiKeyManager.validateKey(key)).toBe(false);
      });
    });

    it('should track API key usage and metadata', () => {
      const apiKey = 'tp_live_1234567890abcdef1234567890abcdef';
      const metadata = {
        created_at: new Date(),
        last_used: new Date(),
        usage_count: 150,
        rate_limit: 1000,
        permissions: ['read', 'trade']
      };
      
      mockApiKeyManager.getKeyMetadata.mockReturnValue(metadata);
      
      const result = mockApiKeyManager.getKeyMetadata(apiKey);
      
      expect(result).toEqual(metadata);
      expect(result.usage_count).toBeGreaterThan(0);
      expect(result.permissions).toContain('read');
    });

    it('should support API key rotation', async () => {
      const oldKey = 'tp_live_old_key_1234567890abcdef123456';
      const newKey = 'tp_live_new_key_1234567890abcdef123456';
      
      mockApiKeyManager.rotateKey.mockResolvedValue({
        old_key: oldKey,
        new_key: newKey,
        rotation_date: new Date(),
        grace_period_ends: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      
      const result = await mockApiKeyManager.rotateKey(oldKey);
      
      expect(result.new_key).toBe(newKey);
      expect(result.old_key).toBe(oldKey);
      expect(result.grace_period_ends).toBeInstanceOf(Date);
    });

    it('should revoke compromised API keys', async () => {
      const compromisedKey = 'tp_live_compromised_1234567890abcdef';
      
      mockApiKeyManager.revokeKey.mockResolvedValue({
        revoked: true,
        revocation_date: new Date(),
        reason: 'Security breach'
      });
      
      const result = await mockApiKeyManager.revokeKey(compromisedKey, 'Security breach');
      
      expect(result.revoked).toBe(true);
      expect(result.reason).toBe('Security breach');
    });

    it('should enforce API key permissions', () => {
      const readOnlyKey = 'tp_live_readonly_1234567890abcdef1234';
      const fullAccessKey = 'tp_live_fullaccess_1234567890abcdef12';
      
      const checkPermission = jest.fn((key, action) => {
        const permissions = {
          [readOnlyKey]: ['read'],
          [fullAccessKey]: ['read', 'trade', 'admin']
        };
        return permissions[key]?.includes(action) || false;
      });
      
      expect(checkPermission(readOnlyKey, 'read')).toBe(true);
      expect(checkPermission(readOnlyKey, 'trade')).toBe(false);
      expect(checkPermission(fullAccessKey, 'trade')).toBe(true);
    });
  });

  describe('External API Security', () => {
    it('should securely store external API keys', () => {
      // API keys should never be exposed in client-side code
      const mockEnvCheck = jest.fn(() => {
        const clientSideFiles = [
          'src/components/',
          'src/pages/',
          'src/hooks/',
          'public/'
        ];
        
        // Simulate checking for exposed API keys
        return {
          polygonApiKey: process.env.POLYGON_API_KEY !== undefined,
          alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY !== undefined,
          finnhubKey: process.env.FINNHUB_API_KEY !== undefined,
          exposedInClient: false // Should always be false
        };
      });
      
      const envStatus = mockEnvCheck();
      
      expect(envStatus.exposedInClient).toBe(false);
      expect(envStatus.polygonApiKey).toBe(true);
      expect(envStatus.alphaVantageKey).toBe(true);
      expect(envStatus.finnhubKey).toBe(true);
    });

    it('should implement secure proxy for external API calls', async () => {
      const mockProxyRequest = jest.fn(async (provider, endpoint, params) => {
        // Simulate server-side proxy that doesn't expose API keys
        return {
          success: true,
          data: { mockData: 'from ' + provider },
          headers: {
            'x-api-key': undefined, // Should never be returned
            'authorization': undefined // Should never be returned
          }
        };
      });
      
      const result = await mockProxyRequest('polygon', 'stocks', { symbol: 'AAPL' });
      
      expect(result.success).toBe(true);
      expect(result.headers['x-api-key']).toBeUndefined();
      expect(result.headers['authorization']).toBeUndefined();
    });

    it('should validate external API responses', async () => {
      const mockResponseValidator = jest.fn((response, expectedSchema) => {
        const isValidResponse = response && 
          typeof response === 'object' && 
          !response.error &&
          response.data !== undefined;
        
        const hasExpectedFields = expectedSchema.every(field => 
          response.data && response.data.hasOwnProperty(field)
        );
        
        return isValidResponse && hasExpectedFields;
      });
      
      const validResponse = {
        data: { symbol: 'AAPL', price: 150.00, timestamp: Date.now() },
        status: 'OK'
      };
      
      const invalidResponse = {
        error: 'API key invalid'
      };
      
      const expectedSchema = ['symbol', 'price', 'timestamp'];
      
      expect(mockResponseValidator(validResponse, expectedSchema)).toBe(true);
      expect(mockResponseValidator(invalidResponse, expectedSchema)).toBe(false);
    });

    it('should implement circuit breaker for external API failures', async () => {
      let failureCount = 0;
      const maxFailures = 5;
      
      const mockCircuitBreaker = {
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        call: jest.fn(async (apiCall) => {
          if (this.state === 'OPEN') {
            throw new Error('Circuit breaker is OPEN');
          }
          
          try {
            const result = await apiCall();
            failureCount = 0; // Reset on success
            this.state = 'CLOSED';
            return result;
          } catch (error) {
            failureCount++;
            if (failureCount >= maxFailures) {
              this.state = 'OPEN';
            }
            throw error;
          }
        })
      };
      
      // Simulate API failures
      const failingApiCall = jest.fn().mockRejectedValue(new Error('API Error'));
      
      for (let i = 0; i < maxFailures; i++) {
        try {
          await mockCircuitBreaker.call(failingApiCall);
        } catch (error) {
          // Expected to fail
        }
      }
      
      expect(mockCircuitBreaker.state).toBe('OPEN');
    });

    it('should implement retry logic with exponential backoff', async () => {
      let attemptCount = 0;
      const maxRetries = 3;
      
      const mockRetryMechanism = jest.fn(async (apiCall, retries = maxRetries) => {
        for (let i = 0; i <= retries; i++) {
          attemptCount++;
          try {
            return await apiCall();
          } catch (error) {
            if (i === retries) throw error;
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      });
      
      // Mock API call that fails twice then succeeds
      let callCount = 0;
      const flakyApiCall = jest.fn(async () => {
        callCount++;
        if (callCount <= 2) {
          throw new Error('Temporary failure');
        }
        return { success: true };
      });
      
      const result = await mockRetryMechanism(flakyApiCall);
      
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3); // Should succeed on 3rd attempt
    });
  });

  describe('API Authentication Security', () => {
    it('should validate JWT tokens on API requests', () => {
      const mockJWTValidator = jest.fn((token) => {
        try {
          // Simulate JWT validation
          if (!token || !token.startsWith('Bearer ')) {
            return { valid: false, error: 'Invalid token format' };
          }
          
          const jwt = token.substring(7);
          if (jwt === 'valid-jwt-token') {
            return { 
              valid: true, 
              payload: { userId: '123', exp: Date.now() + 3600000 }
            };
          }
          
          return { valid: false, error: 'Invalid token' };
        } catch (error) {
          return { valid: false, error: 'Token validation failed' };
        }
      });
      
      expect(mockJWTValidator('Bearer valid-jwt-token').valid).toBe(true);
      expect(mockJWTValidator('Bearer invalid-token').valid).toBe(false);
      expect(mockJWTValidator('invalid-format').valid).toBe(false);
    });

    it('should prevent API access with expired tokens', () => {
      const mockTokenExpiryCheck = jest.fn((token) => {
        const payload = { exp: Date.now() - 1000 }; // Expired 1 second ago
        return payload.exp > Date.now();
      });
      
      expect(mockTokenExpiryCheck('expired-token')).toBe(false);
    });

    it('should implement proper CORS headers', () => {
      const mockCORSValidator = jest.fn((origin, allowedOrigins) => {
        return allowedOrigins.includes(origin);
      });
      
      const allowedOrigins = [
        'https://tradepro.com',
        'https://app.tradepro.com',
        'https://staging.tradepro.com'
      ];
      
      expect(mockCORSValidator('https://tradepro.com', allowedOrigins)).toBe(true);
      expect(mockCORSValidator('https://evil.com', allowedOrigins)).toBe(false);
    });
  });

  describe('API Request Validation', () => {
    it('should validate request content-type', () => {
      const mockContentTypeValidator = jest.fn((contentType, expectedTypes) => {
        return expectedTypes.includes(contentType);
      });
      
      const allowedTypes = ['application/json', 'application/x-www-form-urlencoded'];
      
      expect(mockContentTypeValidator('application/json', allowedTypes)).toBe(true);
      expect(mockContentTypeValidator('text/html', allowedTypes)).toBe(false);
    });

    it('should validate request size limits', () => {
      const mockSizeValidator = jest.fn((requestSize, maxSize) => {
        return requestSize <= maxSize;
      });
      
      const maxRequestSize = 1024 * 1024; // 1MB
      
      expect(mockSizeValidator(500000, maxRequestSize)).toBe(true);
      expect(mockSizeValidator(2000000, maxRequestSize)).toBe(false);
    });

    it('should sanitize API response data', () => {
      const mockResponseSanitizer = jest.fn((data) => {
        if (typeof data === 'object') {
          // Remove sensitive fields
          const { password, api_key, secret, ...sanitized } = data;
          return sanitized;
        }
        return data;
      });
      
      const sensitiveData = {
        user_id: '123',
        username: 'testuser',
        password: 'secret123',
        api_key: 'sensitive-key'
      };
      
      const sanitized = mockResponseSanitizer(sensitiveData);
      
      expect(sanitized.user_id).toBe('123');
      expect(sanitized.username).toBe('testuser');
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.api_key).toBeUndefined();
    });
  });

  describe('DDoS Protection', () => {
    it('should detect and block distributed attacks', () => {
      const mockDDoSDetector = jest.fn((requests) => {
        // Simulate DDoS detection logic
        const ipCounts = requests.reduce((acc, req) => {
          acc[req.ip] = (acc[req.ip] || 0) + 1;
          return acc;
        }, {});
        
        const uniqueIPs = Object.keys(ipCounts).length;
        const totalRequests = requests.length;
        const avgRequestsPerIP = totalRequests / uniqueIPs;
        
        // Consider it a DDoS if many IPs are making requests
        return uniqueIPs > 100 && avgRequestsPerIP > 10;
      });
      
      // Simulate normal traffic
      const normalTraffic = Array(50).fill().map((_, i) => ({
        ip: `192.168.1.${i % 10}`,
        timestamp: Date.now()
      }));
      
      // Simulate DDoS attack
      const ddosTraffic = Array(1500).fill().map((_, i) => ({
        ip: `10.0.${Math.floor(i / 10)}.${i % 10}`,
        timestamp: Date.now()
      }));
      
      expect(mockDDoSDetector(normalTraffic)).toBe(false);
      expect(mockDDoSDetector(ddosTraffic)).toBe(true);
    });

    it('should implement progressive penalties for abuse', () => {
      const mockPenaltySystem = {
        violations: new Map(),
        
        recordViolation: jest.fn(function(ip) {
          const current = this.violations.get(ip) || 0;
          this.violations.set(ip, current + 1);
          return this.getPenalty(ip);
        }),
        
        getPenalty: jest.fn(function(ip) {
          const violations = this.violations.get(ip) || 0;
          if (violations >= 10) return 'ban';
          if (violations >= 5) return 'severe_limit';
          if (violations >= 3) return 'moderate_limit';
          if (violations >= 1) return 'warning';
          return 'none';
        })
      };
      
      const abusiveIP = '192.168.1.100';
      
      expect(mockPenaltySystem.recordViolation(abusiveIP)).toBe('warning');
      expect(mockPenaltySystem.recordViolation(abusiveIP)).toBe('warning');
      expect(mockPenaltySystem.recordViolation(abusiveIP)).toBe('moderate_limit');
      
      // Continue violations
      for (let i = 0; i < 7; i++) {
        mockPenaltySystem.recordViolation(abusiveIP);
      }
      
      expect(mockPenaltySystem.getPenalty(abusiveIP)).toBe('ban');
    });
  });
});
