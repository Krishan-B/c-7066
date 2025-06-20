import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import winston from 'winston';

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/api-proxy-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/api-proxy.log' }),
  ],
});

// Rate limiting configuration
export const createRateLimiter = (windowMs: number = 3600000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: 'Too many requests, please try again later.' },
    handler: (req: Request, res: Response) => {
      logger.warn({
        type: 'RATE_LIMIT_EXCEEDED',
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated',
        path: req.path,
      });
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    },
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return (req.user?.id || req.ip) as string;
    },
  });
};

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: Function): void => {
  // Validate authentication
  if (!req.user) {
    logger.warn({
      type: 'UNAUTHORIZED_ACCESS',
      ip: req.ip,
      path: req.path,
    });
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Validate path
  const validPaths = ['polygon', 'alphavantage', 'finnhub'];
  const pathParts = req.path.split('/').filter(Boolean);
  const requestedApi = pathParts[0] || '';
  if (!validPaths.includes(requestedApi)) {
    logger.warn({
      type: 'INVALID_API_PATH',
      ip: req.ip,
      userId: req.user.id?.toString() || 'unknown',
      path: req.path,
    });
    res.status(400).json({ error: 'Invalid API endpoint' });
    return;
  }

  next();
};

// Request logging middleware
export const requestLogger = (req: Request, _res: Response, next: Function) => {
  logger.info({
    type: 'API_REQUEST',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id || 'unauthenticated',
  });
  next();
};
