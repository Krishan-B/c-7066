// Security Test Utilities and Helpers
// Provides common utilities for security testing across the TradePro platform

import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface SecurityTestEvent {
  type: 'auth_attempt' | 'api_call' | 'data_access' | 'validation_error';
  timestamp: Date;
  userId?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  details: Record<string, any>;
}

export class SecurityTestCollector {
  private events: SecurityTestEvent[] = [];

  logEvent(event: Omit<SecurityTestEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: new Date()
    });
  }

  getEvents(type?: SecurityTestEvent['type']): SecurityTestEvent[] {
    return type ? this.events.filter(e => e.type === type) : this.events;
  }

  clear(): void {
    this.events = [];
  }

  getAuthAttempts(): SecurityTestEvent[] {
    return this.getEvents('auth_attempt');
  }

  getFailedAuthAttempts(): SecurityTestEvent[] {
    return this.getAuthAttempts().filter(e => !e.success);
  }
}

export class MockJWTManager {
  private readonly secret = 'test-secret-key';

  generateValidToken(payload: Record<string, any>, expiresIn = '1h'): string {
    return jwt.sign(payload, this.secret, { expiresIn });
  }

  generateExpiredToken(payload: Record<string, any>): string {
    return jwt.sign(payload, this.secret, { expiresIn: '-1h' });
  }

  generateInvalidToken(): string {
    return jwt.sign({ invalid: true }, 'wrong-secret');
  }

  generateMalformedToken(): string {
    return 'invalid.jwt.token';
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export class MockSupabaseAuth {
  private users: Map<string, any> = new Map();
  private sessions: Map<string, any> = new Map();

  constructor() {
    // Add test users
    this.users.set('test@example.com', {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: '$2b$10$hash...',
      email_verified: true,
      last_sign_in_at: new Date(),
      failed_attempts: 0,
      locked_until: null
    });
  }

  async signIn(email: string, password: string): Promise<any> {
    const user = this.users.get(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.locked_until && new Date() < user.locked_until) {
      throw new Error('Account locked');
    }

    // Simulate password check
    if (password !== 'correct-password') {
      user.failed_attempts += 1;
      if (user.failed_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      throw new Error('Invalid credentials');
    }

    user.failed_attempts = 0;
    user.locked_until = null;
    
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      user_id: user.id,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    return {
      user,
      session: { access_token: sessionId }
    };
  }

  async signOut(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async getUser(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session || new Date() > session.expires_at) {
      throw new Error('Invalid session');
    }

    return this.users.get('test@example.com');
  }

  addUser(email: string, userData: any): void {
    this.users.set(email, userData);
  }

  clearUsers(): void {
    this.users.clear();
    this.sessions.clear();
  }
}

export const commonInjectionPayloads = {
  sql: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "admin'--",
    "' OR 1=1 /*",
    "'; INSERT INTO users (email, password) VALUES ('hacker@evil.com', 'password'); --"
  ],
  xss: [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "';alert('XSS');//"
  ],
  nosql: [
    "{ $ne: null }",
    "{ $gt: '' }",
    "{ $where: 'function() { return true; }' }",
    "'; return true; var dummy='",
    "admin'; return true; //"
  ],
  ldap: [
    "*)(uid=*",
    "*)(|(uid=*",
    "admin)(&(|(uid=*",
    "*))%00",
    ")(cn=*"
  ]
};

export const maliciousFilePayloads = {
  oversized: 'A'.repeat(10 * 1024 * 1024), // 10MB
  executable: {
    name: 'malicious.exe',
    content: Buffer.from('MZ\x90\x00') // PE header
  },
  script: {
    name: 'script.js',
    content: 'alert("malicious")'
  },
  zipBomb: {
    name: 'bomb.zip',
    content: Buffer.from('PK\x03\x04') // ZIP header
  }
};

export function generateBruteForceAttempts(count: number): Array<{email: string, password: string}> {
  const attempts = [];
  for (let i = 0; i < count; i++) {
    attempts.push({
      email: 'test@example.com',
      password: `attempt-${i}`
    });
  }
  return attempts;
}

export function simulateSlowLoris(requestCount: number, delayMs: number): Promise<void>[] {
  const requests = [];
  for (let i = 0; i < requestCount; i++) {
    requests.push(
      new Promise(resolve => setTimeout(resolve, delayMs * i))
    );
  }
  return requests;
}

export function createMockRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();

  return {
    isAllowed(key: string): boolean {
      const now = Date.now();
      const userRequests = requests.get(key) || [];
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => now - time < windowMs);
      
      if (validRequests.length >= maxRequests) {
        return false;
      }

      validRequests.push(now);
      requests.set(key, validRequests);
      return true;
    },
    
    reset(key?: string): void {
      if (key) {
        requests.delete(key);
      } else {
        requests.clear();
      }
    }
  };
}

export const securityTestHelpers = {
  SecurityTestCollector,
  MockJWTManager,
  MockSupabaseAuth,
  commonInjectionPayloads,
  maliciousFilePayloads,
  generateBruteForceAttempts,
  simulateSlowLoris,
  createMockRateLimiter
};

export default securityTestHelpers;
