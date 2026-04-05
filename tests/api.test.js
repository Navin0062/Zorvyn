const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/connection');

describe('Finance API Integration Tests', () => {
  let adminToken;
  let analystToken;
  let viewerToken;

  beforeAll(() => {
    // Clear database
    db.exec('DELETE FROM financial_records');
    db.exec('DELETE FROM users');
  });

  afterAll(() => {
    // Clean up
    db.exec('DELETE FROM financial_records');
    db.exec('DELETE FROM users');
  });

  describe('Authentication', () => {
    it('should register and login admin user', async () => {
      // Register admin
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin'
        });

      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body).toHaveProperty('token');
      
      adminToken = registerRes.body.token;

      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'admin123'
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
    });

    it('should register analyst user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'analyst@test.com',
          password: 'analyst123',
          name: 'Analyst User',
          role: 'analyst'
        });

      expect(res.statusCode).toBe(201);
      analystToken = res.body.token;
    });

    it('should register viewer user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'viewer@test.com',
          password: 'viewer123',
          name: 'Viewer User',
          role: 'viewer'
        });

      expect(res.statusCode).toBe(201);
      viewerToken = res.body.token;
    });
  });

  describe('Financial Records', () => {
    let recordId;

    it('should allow analyst to create a record', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 1000.00,
          type: 'income',
          category: 'Salary',
          date: '2026-04-01',
          description: 'Monthly salary'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.record).toHaveProperty('amount', 1000.00);
      recordId = res.body.record.id;
    });

    it('should get dashboard summary', async () => {
      const res = await request(app)
        .get('/api/records/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.summary).toHaveProperty('totalIncome');
      expect(res.body.summary).toHaveProperty('totalExpenses');
      expect(res.body.summary).toHaveProperty('netBalance');
    });

    it('should not allow viewer to create records', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 500.00,
          type: 'expense',
          category: 'Food',
          date: '2026-04-02'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to update records', async () => {
      const res = await request(app)
        .put(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 1500.00
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.record.amount).toBe(1500.00);
    });

    it('should allow admin to delete records', async () => {
      const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('User Management', () => {
    let newUserId;

    it('should allow admin to create users', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@test.com',
          password: 'newpassword123',
          name: 'New User',
          role: 'analyst'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('email', 'newuser@test.com');
      newUserId = res.body.user.id;
    });

    it('should not allow non-admin to create users', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          email: 'another@test.com',
          password: 'password123',
          name: 'Another User'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });
});
