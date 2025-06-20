import axios from 'axios';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupRoutes } from '../server/routes';

// Mock axios
vi.mock('axios');

describe('API Proxy Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    setupRoutes(app);
  });

  describe('Security', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/proxy/polygon/stocks/AAPL/quotes').expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should reject requests with invalid paths', async () => {
      const response = await request(app)
        .get('/api/proxy/invalid/endpoint')
        .set('Authorization', 'Bearer test-token')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid API endpoint');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make 101 requests (1 over limit)
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/proxy/polygon/stocks/AAPL/quotes')
          .set('Authorization', 'Bearer test-token');
      }

      const response = await request(app)
        .get('/api/proxy/polygon/stocks/AAPL/quotes')
        .set('Authorization', 'Bearer test-token')
        .expect(429);

      expect(response.body).toHaveProperty('error', 'Too many requests, please try again later.');
    });
  });

  describe('API Proxying', () => {
    it('should successfully proxy Polygon API requests', async () => {
      const mockResponse = { data: { symbol: 'AAPL', price: 150 } };
      (axios.get as any).mockResolvedValueOnce(mockResponse);

      const response = await request(app)
        .get('/api/proxy/polygon/stocks/AAPL/quotes')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual(mockResponse.data);
    });

    it('should handle API errors gracefully', async () => {
      (axios.get as any).mockRejectedValueOnce(new Error('API Error'));

      const response = await request(app)
        .get('/api/proxy/polygon/stocks/AAPL/quotes')
        .set('Authorization', 'Bearer test-token')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).not.toHaveProperty('stack');
    });
  });
});
