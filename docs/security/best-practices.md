# Security Best Practices Guide

## Overview

This document provides comprehensive security best practices for the TradePro trading platform development team, covering secure coding, architecture, deployment, and operational security practices.

## Secure Coding Practices

### Input Validation and Sanitization

#### User Input Validation

```typescript
// Input validation utilities
class InputValidator {
  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || email.length === 0) {
      return { valid: false, error: 'Email is required' };
    }
    
    if (email.length > 254) {
      return { valid: false, error: 'Email too long' };
    }
    
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    return { valid: true };
  }

  static validatePassword(password: string): ValidationResult {
    const requirements = {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      disallowCommonPasswords: true
    };

    if (!password) {
      return { valid: false, error: 'Password is required' };
    }

    if (password.length < requirements.minLength) {
      return { valid: false, error: `Password must be at least ${requirements.minLength} characters` };
    }

    if (password.length > requirements.maxLength) {
      return { valid: false, error: `Password must be no more than ${requirements.maxLength} characters` };
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain uppercase letters' };
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain lowercase letters' };
    }

    if (requirements.requireNumbers && !/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain numbers' };
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, error: 'Password must contain special characters' };
    }

    if (requirements.disallowCommonPasswords && this.isCommonPassword(password)) {
      return { valid: false, error: 'Password is too common' };
    }

    return { valid: true };
  }

  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Remove null bytes
    input = input.replace(/\x00/g, '');
    
    // Trim whitespace
    input = input.trim();
    
    // Limit length
    if (input.length > 10000) {
      input = input.substring(0, 10000);
    }
    
    return input;
  }

  static validateAndSanitizeNumeric(value: any, min?: number, max?: number): number | null {
    const num = parseFloat(value);
    
    if (isNaN(num) || !isFinite(num)) {
      return null;
    }
    
    if (min !== undefined && num < min) {
      return null;
    }
    
    if (max !== undefined && num > max) {
      return null;
    }
    
    return num;
  }
}
```

#### SQL Injection Prevention

```typescript
// Database query utilities with parameterized queries
class DatabaseUtils {
  static async executeQuery(query: string, params: any[]): Promise<any> {
    // Always use parameterized queries
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      // Log error without exposing sensitive information
      logger.error('Database query failed', { 
        error: error.message,
        queryId: generateQueryId() // Don't log actual query or params
      });
      throw new Error('Database operation failed');
    }
  }

  // Example of secure user lookup
  static async getUserById(userId: string): Promise<User | null> {
    const query = 'SELECT id, email, created_at FROM users WHERE id = $1 AND deleted_at IS NULL';
    const results = await this.executeQuery(query, [userId]);
    return results.length > 0 ? results[0] : null;
  }

  // Example of secure trading data query
  static async getUserTrades(userId: string, limit: number = 100): Promise<Trade[]> {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }
    
    const validatedLimit = InputValidator.validateAndSanitizeNumeric(limit, 1, 1000);
    if (validatedLimit === null) {
      throw new Error('Invalid limit parameter');
    }

    const query = `
      SELECT id, symbol, quantity, price, side, status, created_at 
      FROM trades 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    
    return await this.executeQuery(query, [userId, validatedLimit]);
  }
}
```

#### XSS Prevention

```typescript
// HTML sanitization and encoding
import DOMPurify from 'dompurify';

class XSSProtection {
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }

  static encodeForHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  static encodeForHTMLAttribute(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static encodeForJavaScript(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e');
  }
}

// React component with XSS protection
const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div>
      <h1>{XSSProtection.encodeForHTML(user.name)}</h1>
      <p>Email: {XSSProtection.encodeForHTML(user.email)}</p>
      {/* For rich text content */}
      <div 
        dangerouslySetInnerHTML={{ 
          __html: XSSProtection.sanitizeHTML(user.bio) 
        }} 
      />
    </div>
  );
};
```

### Authentication and Session Security

#### Secure Password Handling

```typescript
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class PasswordSecurity {
  private static readonly SALT_ROUNDS = 12;
  private static readonly PEPPER = process.env.PASSWORD_PEPPER || '';

  static async hashPassword(password: string): Promise<string> {
    // Add pepper to password
    const pepperedPassword = password + this.PEPPER;
    
    // Generate salt and hash
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hash = await bcrypt.hash(pepperedPassword, salt);
    
    return hash;
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const pepperedPassword = password + this.PEPPER;
    return await bcrypt.compare(pepperedPassword, hash);
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static async hashPasswordWithTimingProtection(password: string, storedHash?: string): Promise<string | boolean> {
    const startTime = process.hrtime.bigint();
    
    if (storedHash) {
      // Verification
      const result = await this.verifyPassword(password, storedHash);
      
      // Add timing protection
      const elapsedTime = process.hrtime.bigint() - startTime;
      const minTime = BigInt(100_000_000); // 100ms in nanoseconds
      
      if (elapsedTime < minTime) {
        await new Promise(resolve => 
          setTimeout(resolve, Number((minTime - elapsedTime) / BigInt(1_000_000)))
        );
      }
      
      return result;
    } else {
      // Hashing
      const result = await this.hashPassword(password);
      
      // Consistent timing
      const elapsedTime = process.hrtime.bigint() - startTime;
      const minTime = BigInt(100_000_000); // 100ms in nanoseconds
      
      if (elapsedTime < minTime) {
        await new Promise(resolve => 
          setTimeout(resolve, Number((minTime - elapsedTime) / BigInt(1_000_000)))
        );
      }
      
      return result;
    }
  }
}
```

#### Session Management

```typescript
import jwt from 'jsonwebtoken';

class SessionManager {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || '';
  private static readonly JWT_EXPIRES_IN = '15m';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  static generateTokens(userId: string, sessionId: string): TokenPair {
    const accessToken = jwt.sign(
      { 
        userId, 
        sessionId,
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
      },
      this.JWT_SECRET,
      { 
        expiresIn: this.JWT_EXPIRES_IN,
        algorithm: 'HS256'
      }
    );

    const refreshToken = jwt.sign(
      { 
        userId, 
        sessionId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
      },
      this.JWT_SECRET,
      { 
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256'
      }
    );

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string, expectedType: 'access' | 'refresh'): TokenPayload | null {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as any;
      
      if (payload.type !== expectedType) {
        return null;
      }

      return {
        userId: payload.userId,
        sessionId: payload.sessionId,
        type: payload.type,
        iat: payload.iat,
        exp: payload.exp
      };
    } catch (error) {
      return null;
    }
  }

  static async createSession(userId: string, metadata: SessionMetadata): Promise<Session> {
    const sessionId = PasswordSecurity.generateSecureToken(32);
    const tokens = this.generateTokens(userId, sessionId);
    
    const session = {
      id: sessionId,
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    await this.storeSession(session);
    return session;
  }

  static async validateSession(accessToken: string): Promise<Session | null> {
    const payload = this.verifyToken(accessToken, 'access');
    if (!payload) return null;

    const session = await this.getSession(payload.sessionId);
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // Update last used time
    session.lastUsedAt = new Date();
    await this.updateSession(session);

    return session;
  }
}
```

### API Security

#### Rate Limiting

```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

class RateLimitManager {
  private static rateLimiters = new Map<string, RateLimiterMemory>();

  static createRateLimiter(key: string, options: RateLimiterOptions): void {
    this.rateLimiters.set(key, new RateLimiterMemory({
      keyPrefix: key,
      points: options.requests,
      duration: options.windowMs / 1000,
      blockDuration: options.blockDurationMs / 1000
    }));
  }

  static async checkRateLimit(key: string, identifier: string): Promise<RateLimitResult> {
    const limiter = this.rateLimiters.get(key);
    if (!limiter) {
      throw new Error(`Rate limiter ${key} not found`);
    }

    try {
      const result = await limiter.consume(identifier);
      return {
        allowed: true,
        remainingPoints: result.remainingPoints,
        msBeforeNext: result.msBeforeNext
      };
    } catch (rejRes) {
      return {
        allowed: false,
        remainingPoints: 0,
        msBeforeNext: rejRes.msBeforeNext,
        retryAfter: new Date(Date.now() + rejRes.msBeforeNext)
      };
    }
  }

  // Middleware for Express
  static createMiddleware(rateLimiterKey: string, getIdentifier?: (req: Request) => string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const identifier = getIdentifier ? getIdentifier(req) : req.ip;
      
      try {
        const result = await this.checkRateLimit(rateLimiterKey, identifier);
        
        if (!result.allowed) {
          res.status(429).json({
            error: 'Too Many Requests',
            retryAfter: result.retryAfter
          });
          return;
        }

        // Add rate limit headers
        res.set({
          'X-RateLimit-Remaining': result.remainingPoints.toString(),
          'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString()
        });

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

// Initialize rate limiters
RateLimitManager.createRateLimiter('api', {
  requests: 100,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 60 * 1000 // Block for 1 minute
});

RateLimitManager.createRateLimiter('auth', {
  requests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000 // Block for 15 minutes
});

RateLimitManager.createRateLimiter('trading', {
  requests: 10,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 60 * 1000 // Block for 1 minute
});
```

#### API Key Security

```typescript
class ApiKeyManager {
  static async generateApiKey(userId: string, permissions: string[]): Promise<ApiKey> {
    const keyId = PasswordSecurity.generateSecureToken(16);
    const secret = PasswordSecurity.generateSecureToken(32);
    const hashedSecret = await PasswordSecurity.hashPassword(secret);

    const apiKey = {
      id: keyId,
      userId,
      name: `API Key ${keyId}`,
      hashedSecret,
      permissions,
      createdAt: new Date(),
      lastUsedAt: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      rateLimit: {
        requests: 1000,
        windowMs: 60 * 60 * 1000 // 1 hour
      }
    };

    await this.storeApiKey(apiKey);

    return {
      ...apiKey,
      secret // Only return secret once
    };
  }

  static async validateApiKey(keyId: string, secret: string): Promise<ApiKey | null> {
    const apiKey = await this.getApiKey(keyId);
    
    if (!apiKey || !apiKey.isActive || apiKey.expiresAt < new Date()) {
      return null;
    }

    const isValid = await PasswordSecurity.verifyPassword(secret, apiKey.hashedSecret);
    if (!isValid) {
      return null;
    }

    // Update last used
    apiKey.lastUsedAt = new Date();
    await this.updateApiKey(apiKey);

    return apiKey;
  }

  static async rotateApiKey(keyId: string): Promise<ApiKey> {
    const existingKey = await this.getApiKey(keyId);
    if (!existingKey) {
      throw new Error('API key not found');
    }

    // Deactivate old key
    existingKey.isActive = false;
    await this.updateApiKey(existingKey);

    // Create new key with same permissions
    return await this.generateApiKey(existingKey.userId, existingKey.permissions);
  }
}
```

### Encryption and Data Protection

#### Data Encryption at Rest

```typescript
import crypto from 'crypto';

class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_SIZE = 32; // 256 bits
  private static readonly IV_SIZE = 16; // 128 bits
  private static readonly TAG_SIZE = 16; // 128 bits

  static encrypt(plaintext: string, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(this.IV_SIZE);
    const cipher = crypto.createCipher(this.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  static decrypt(encryptedData: EncryptedData, key: Buffer): string {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipher(this.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static generateEncryptionKey(): Buffer {
    return crypto.randomBytes(this.KEY_SIZE);
  }

  static deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.KEY_SIZE, 'sha256');
  }
}

// Database field encryption
class DatabaseEncryption {
  private static readonly ENCRYPTION_KEY = Buffer.from(process.env.DB_ENCRYPTION_KEY || '', 'hex');

  static async encryptSensitiveField(value: string): Promise<string> {
    const encrypted = EncryptionService.encrypt(value, this.ENCRYPTION_KEY);
    return JSON.stringify(encrypted);
  }

  static async decryptSensitiveField(encryptedValue: string): Promise<string> {
    const encrypted = JSON.parse(encryptedValue);
    return EncryptionService.decrypt(encrypted, this.ENCRYPTION_KEY);
  }
}
```

#### Secure Communication

```typescript
// HTTPS enforcement middleware
class HTTPSEnforcement {
  static requireHTTPS() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect(301, `https://${req.get('host')}${req.url}`);
      }
      next();
    };
  }

  static setSecurityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Strict Transport Security
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      
      // Content Security Policy
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://api.tradepro.com"
      );
      
      // X-Content-Type-Options
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // X-Frame-Options
      res.setHeader('X-Frame-Options', 'DENY');
      
      // X-XSS-Protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer Policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      next();
    };
  }
}
```

## Deployment Security

### Environment Configuration

```bash
# Production environment variables template
# Never commit actual values to version control

# Application
NODE_ENV=production
PORT=3000
APP_URL=https://tradepro.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_SSL=true
DATABASE_CONNECTION_LIMIT=20

# Authentication
JWT_SECRET=<generated-secret-256-bits>
PASSWORD_PEPPER=<generated-pepper-256-bits>
SESSION_SECRET=<generated-session-secret>

# Encryption
DB_ENCRYPTION_KEY=<generated-encryption-key-256-bits>
API_ENCRYPTION_KEY=<generated-api-encryption-key>

# External APIs (use server-side proxy)
POLYGON_API_KEY=<polygon-api-key>
ALPHA_VANTAGE_API_KEY=<alpha-vantage-api-key>
FINNHUB_API_KEY=<finnhub-api-key>

# Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=info

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_SALT_ROUNDS=12
```

### Docker Security

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Security: Update packages
RUN apk update && apk upgrade

# Security: Remove unnecessary packages
RUN apk del apk-tools

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Security: Set file permissions
RUN chmod -R 755 /app
RUN chmod -R 644 /app/dist

# Security: Switch to non-root user
USER nextjs

# Expose port (use non-privileged port)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/server.js"]
```

### Kubernetes Security

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tradepro-api
  namespace: tradepro
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tradepro-api
  template:
    metadata:
      labels:
        app: tradepro-api
    spec:
      # Security: Service account
      serviceAccountName: tradepro-api
      
      # Security: Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        
      containers:
      - name: api
        image: tradepro/api:latest
        ports:
        - containerPort: 3000
          protocol: TCP
          
        # Security: Container security context
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
            
        # Resource limits
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
            
        # Environment variables from secrets
        envFrom:
        - secretRef:
            name: tradepro-api-secrets
            
        # Liveness and readiness probes
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          
        # Volume mounts for temporary files
        volumeMounts:
        - name: tmp
          mountPath: /tmp
          
      volumes:
      - name: tmp
        emptyDir: {}
        
      # Security: Image pull policy
      imagePullPolicy: Always
      
      # Security: Pod security
      automountServiceAccountToken: false
```

## Monitoring and Logging

### Security Logging

```typescript
import winston from 'winston';

class SecurityLogger {
  private static logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'tradepro-security' },
    transports: [
      new winston.transports.File({ filename: 'logs/security.log' }),
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });

  static logSecurityEvent(event: SecurityEvent): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: event.level,
      type: event.type,
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      riskScore: event.riskScore
    };

    this.logger.info('Security Event', logEntry);
    
    // Send to SIEM if critical
    if (event.level === 'critical') {
      this.sendToSIEM(logEntry);
    }
  }

  static logAuthenticationEvent(event: AuthEvent): void {
    this.logSecurityEvent({
      level: event.success ? 'info' : 'warning',
      type: 'authentication',
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: {
        action: event.action,
        success: event.success,
        reason: event.reason
      },
      riskScore: event.success ? 0 : this.calculateAuthRiskScore(event)
    });
  }

  static logDataAccessEvent(event: DataAccessEvent): void {
    this.logSecurityEvent({
      level: 'info',
      type: 'data_access',
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: {
        resource: event.resource,
        action: event.action,
        recordCount: event.recordCount
      },
      riskScore: this.calculateDataAccessRiskScore(event)
    });
  }
}
```

## Code Review Security Checklist

### Pre-Commit Checklist

- [ ] No hardcoded credentials or API keys
- [ ] Input validation implemented for all user inputs
- [ ] SQL queries use parameterized statements
- [ ] Authentication and authorization checks in place
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't include sensitive data
- [ ] Rate limiting implemented for API endpoints
- [ ] HTTPS enforcement configured
- [ ] Security headers set appropriately
- [ ] Dependencies are up to date and vulnerability-free

### Security Code Review Guidelines

```typescript
// Security review checklist for pull requests
const securityReviewChecklist = {
  authentication: [
    'Are passwords properly hashed with salt?',
    'Is session management secure?',
    'Are JWT tokens properly validated?',
    'Is multi-factor authentication implemented correctly?'
  ],
  
  authorization: [
    'Are access controls properly implemented?',
    'Is the principle of least privilege followed?',
    'Are all endpoints properly protected?',
    'Is role-based access control working correctly?'
  ],
  
  inputValidation: [
    'Are all inputs validated and sanitized?',
    'Is output encoding implemented?',
    'Are file uploads restricted and validated?',
    'Is there protection against injection attacks?'
  ],
  
  dataProtection: [
    'Is sensitive data encrypted at rest?',
    'Is data transmitted over secure channels?',
    'Are backups encrypted?',
    'Is data retention properly implemented?'
  ],
  
  errorHandling: [
    'Do error messages avoid leaking sensitive information?',
    'Is logging implemented without exposing secrets?',
    'Are stack traces hidden in production?',
    'Is there proper exception handling?'
  ]
};
```

## Security Testing Integration

### Automated Security Testing

```yaml
# GitHub Actions security testing workflow
name: Security Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run security audit
      run: npm audit --audit-level=moderate
    
    - name: Run SAST with CodeQL
      uses: github/codeql-action/analyze@v2
      with:
        languages: javascript, typescript
    
    - name: Run dependency vulnerability scan
      uses: securecodewarrior/github-action-add-sarif@v1
      with:
        sarif-file: 'security-scan-results.sarif'
    
    - name: Run unit tests with coverage
      run: npm run test:coverage
    
    - name: Run security-specific tests
      run: npm run test:security
```

---

**Document Control**

- Version: 1.0
- Last Updated: June 1, 2025
- Next Review: September 1, 2025
- Owner: Development Team
