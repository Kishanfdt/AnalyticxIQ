import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Express API Integration Tests', () => {
  describe('GET /health', () => {
    it('should respond with health metrics and status UP', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('UP');
    });

    it('should contain Helmet security headers', async () => {
      const res = await request(app).get('/health');

      // Helmet sets these security headers
      expect(res.headers).toHaveProperty('x-frame-options');
      expect(res.headers).toHaveProperty('content-security-policy');
      expect(res.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 Bad Request if fields are missing', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: '' }); // missing password

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /invalid-route', () => {
    it('should return 404 for non-existent API routes', async () => {
      const res = await request(app).get('/invalid-route');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
