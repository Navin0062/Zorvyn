const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/connection');

describe('Authentication API', () => {
  // No beforeEach cleanup needed since each test uses unique emails

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const timestamp = Date.now();
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${timestamp}@example.com`,
          password: 'password123',
          name: 'Test User'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', `test${timestamp}@example.com`);
      expect(res.body.user.role).toBe('viewer');
    });

    it('should reject registration with existing email', async () => {
      const timestamp = Date.now();
      await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${timestamp}@example.com`,
          password: 'password123',
          name: 'Test User'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${timestamp}@example.com`,
          password: 'password123',
          name: 'Another User'
        });

      expect(res.statusCode).toBe(409);
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'short',
          name: 'Test User'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    let testEmail;
    
    beforeEach(async () => {
      testEmail = `logintest${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: 'password123',
          name: 'Test User'
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testEmail);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: `nonexistent${Date.now()}@example.com`,
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
