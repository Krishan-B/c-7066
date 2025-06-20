import rateLimit from 'express-rate-limit';

import { env } from '../config';

// Create a rate limiter that tracks requests by IP
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // default: 1 hour
  max: env.RATE_LIMIT_MAX_REQUESTS, // default: 100 requests per window
  standardHeaders: true,
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
    retryAfter: 'See retry-after header',
  },
  skipFailedRequests: false, // Count failed requests against the rate limit
  keyGenerator: (req) => {
    // Use IP address as default key
    return req.ip;
  },
});

// Specific rate limiters for different APIs if needed
export const polygonRateLimiter = rateLimit({
  ...apiRateLimiter,
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute for Polygon
  keyGenerator: (req) => `polygon:${req.ip}`,
});

export const alphaVantageRateLimiter = rateLimit({
  ...apiRateLimiter,
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute for Alpha Vantage
  keyGenerator: (req) => `alphavantage:${req.ip}`,
});

export const finnhubRateLimiter = rateLimit({
  ...apiRateLimiter,
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute for Finnhub
  keyGenerator: (req) => `finnhub:${req.ip}`,
});
