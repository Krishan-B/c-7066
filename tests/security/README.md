# Security Test Suite Setup

## Overview

This document provides the setup and configuration for comprehensive security testing of the TradePro platform.

## Test Structure

```
tests/
├── security/
│   ├── auth/
│   │   ├── authentication.test.ts
│   │   ├── authorization.test.ts
│   │   ├── session-management.test.ts
│   │   └── password-security.test.ts
│   ├── api/
│   │   ├── rate-limiting.test.ts
│   │   ├── api-key-security.test.ts
│   │   └── external-api.test.ts
│   ├── data/
│   │   ├── input-validation.test.ts
│   │   ├── sql-injection.test.ts
│   │   └── xss-protection.test.ts
│   └── integration/
│       ├── security-headers.test.ts
│       ├── https-enforcement.test.ts
│       └── vulnerability-scan.test.ts
└── utils/
    └── security-test-helpers.ts
```

## Jest Configuration

Add to `jest.config.js`:

```javascript
module.exports = {
  // ... existing configuration
  testMatch: [
    "**/__tests__/**/*.(ts|js)",
    "**/*.(test|spec).(ts|js)",
    "**/tests/security/**/*.(test|spec).(ts|js)"
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Security-critical modules require higher coverage
    "src/utils/auth/**/*.ts": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    "src/features/auth/**/*.ts": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

## Package Dependencies

Add to `package.json`:

```json
{
  "devDependencies": {
    "@types/supertest": "^6.0.2",
    "supertest": "^6.3.4",
    "nock": "^13.5.0",
    "jest-environment-jsdom": "^29.7.0",
    "puppeteer": "^21.11.0",
    "@types/puppeteer": "^7.0.4",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  }
}
```

## Testing Scripts

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test:security": "jest tests/security --coverage",
    "test:security:watch": "jest tests/security --watch",
    "test:security:ci": "jest tests/security --coverage --ci --watchAll=false",
    "test:integration": "jest tests/security/integration --runInBand",
    "test:vulnerability": "npm audit && npm run test:security",
    "security:scan": "npx @eslint/security-scan src/"
  }
}
```

## Security Testing Utilities

Create `tests/utils/security-test-helpers.ts`:

```typescript
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class SecurityTestHelpers {
  static createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
    return {
      ip: '127.0.0.1',
      get: jest.fn(),
      headers: {},
      body: {},
      params: {},
      query: {},
      ...overrides
    };
  }

  static createMockResponse(): Partial<Response> {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis()
    };
    return res;
  }

  static generateValidJWT(payload: any = {}, secret: string = 'test-secret'): string {
    return jwt.sign(
      {
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        iat: Math.floor(Date.now() / 1000),
        ...payload
      },
      secret,
      { expiresIn: '1h' }
    );
  }

  static generateExpiredJWT(payload: any = {}, secret: string = 'test-secret'): string {
    return jwt.sign(
      {
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        ...payload
      },
      secret
    );
  }

  static async generateHashedPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  static generateSecurePassword(): string {
    return 'SecureP@ssw0rd123!';
  }

  static generateWeakPassword(): string {
    return 'password';
  }

  static generateSQLInjectionPayloads(): string[] {
    return [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "admin'/*",
      "' OR 1=1#",
      "') OR ('1'='1",
      "1' ORDER BY 1--+",
      "1' UNION SELECT NULL,NULL,NULL--+",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --"
    ];
  }

  static generateXSSPayloads(): string[] {
    return [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')",
      "<svg onload=alert('XSS')>",
      "<iframe src=javascript:alert('XSS')>",
      "';alert('XSS');//",
      "<script>document.location='http://evil.com'</script>",
      "<body onload=alert('XSS')>",
      "<div onclick=alert('XSS')>Click me</div>",
      "<input onfocus=alert('XSS') autofocus>"
    ];
  }

  static generateInvalidInputs(): any[] {
    return [
      null,
      undefined,
      '',
      ' ',
      '\n\r\t',
      'a'.repeat(10000), // Very long string
      {},
      [],
      { toString: () => { throw new Error('Dangerous toString'); } },
      '\0', // Null byte
      '../../../etc/passwd', // Path traversal
      'file:///etc/passwd',
      'http://evil.com/malicious.js'
    ];
  }

  static async simulateSlowDatabaseQuery(delayMs: number = 5000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  static generateConcurrentRequests(count: number, requestFn: () => Promise<any>): Promise<any[]> {
    const requests = Array(count).fill(null).map(() => requestFn());
    return Promise.all(requests);
  }

  static verifySecurityHeaders(headers: Record<string, string>): boolean {
    const requiredHeaders = [
      'strict-transport-security',
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    return requiredHeaders.every(header => 
      Object.keys(headers).some(h => h.toLowerCase() === header)
    );
  }

  static isValidCSP(csp: string): boolean {
    // Basic CSP validation
    return csp.includes("default-src") && 
           csp.includes("'self'") &&
           !csp.includes("'unsafe-eval'");
  }

  static generateRateLimitTestRequests(count: number, endpoint: string): Array<() => Promise<any>> {
    return Array(count).fill(null).map(() => 
      () => fetch(endpoint, { method: 'GET' })
    );
  }
}

export class MockDatabase {
  private data: Map<string, any> = new Map();

  async findOne(table: string, id: string): Promise<any> {
    return this.data.get(`${table}:${id}`) || null;
  }

  async insert(table: string, id: string, data: any): Promise<void> {
    this.data.set(`${table}:${id}`, data);
  }

  async update(table: string, id: string, data: any): Promise<void> {
    const existing = this.data.get(`${table}:${id}`);
    if (existing) {
      this.data.set(`${table}:${id}`, { ...existing, ...data });
    }
  }

  async delete(table: string, id: string): Promise<void> {
    this.data.delete(`${table}:${id}`);
  }

  clear(): void {
    this.data.clear();
  }
}

export class SecurityEventCollector {
  private events: any[] = [];

  logEvent(event: any): void {
    this.events.push({
      ...event,
      timestamp: new Date()
    });
  }

  getEvents(): any[] {
    return [...this.events];
  }

  getEventsByType(type: string): any[] {
    return this.events.filter(e => e.type === type);
  }

  clear(): void {
    this.events = [];
  }

  hasEventWithData(data: Partial<any>): boolean {
    return this.events.some(event =>
      Object.entries(data).every(([key, value]) => event[key] === value)
    );
  }
}
```

## Continuous Security Testing

Create `.github/workflows/security-tests.yml`:

```yaml
name: Security Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Run security tests daily at 2 AM UTC
    - cron: '0 2 * * *'

jobs:
  security-tests:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run security audit
      run: npm audit --audit-level=moderate

    - name: Run security linting
      run: npx eslint src/ --ext .ts,.tsx --config .eslintrc.security.js

    - name: Run security tests
      run: npm run test:security:ci

    - name: Run integration security tests
      run: npm run test:integration

    - name: Upload security test coverage
      uses: codecov/codecov-action@v3
      with:
        files: coverage/lcov.info
        flags: security
        name: security-coverage

    - name: Check security coverage threshold
      run: |
        COVERAGE=$(node -pe "JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json')).total.lines.pct")
        if (( $(echo "$COVERAGE < 90" | bc -l) )); then
          echo "Security test coverage is below 90%: $COVERAGE%"
          exit 1
        fi

  vulnerability-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Run CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        languages: javascript, typescript

    - name: Run npm audit
      run: npm audit --audit-level=moderate

    - name: Run Snyk vulnerability scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=medium

  penetration-testing:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' || contains(github.event.head_commit.message, '[security-scan]')
    
    steps:
    - uses: actions/checkout@v4

    - name: Build application
      run: |
        npm ci
        npm run build

    - name: Start application
      run: |
        npm start &
        sleep 30

    - name: Run OWASP ZAP security scan
      uses: zaproxy/action-full-scan@v0.10.0
      with:
        target: 'http://localhost:3000'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-a'
```

## Example Test Files

The test setup includes:

1. **Authentication Tests** - JWT validation, session management, password security
2. **Authorization Tests** - Role-based access control, permission validation
3. **Input Validation Tests** - SQL injection, XSS, CSRF protection
4. **API Security Tests** - Rate limiting, API key validation, external API security
5. **Integration Tests** - HTTPS enforcement, security headers, vulnerability scanning

This comprehensive security testing framework will:

- Achieve >90% test coverage on security-critical components
- Prevent security regressions through CI/CD integration
- Identify vulnerabilities early in development
- Ensure compliance with security best practices
- Provide continuous security monitoring

## Next Steps

1. Install test dependencies: `npm install`
2. Run security tests: `npm run test:security`
3. Check coverage: `npm run test:security:ci`
4. Set up CI/CD integration
5. Schedule regular security scans
