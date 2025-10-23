import request from 'supertest';
import { app } from '../server.js';

describe('Authentication API', () => {
  test('POST /api/register should create new user', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('POST /api/login should authenticate user', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
  });
});