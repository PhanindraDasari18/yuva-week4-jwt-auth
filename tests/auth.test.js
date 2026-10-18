process.env.JWT_SECRET = 'test-secret-which-is-at-least-32-characters-long';
const request = require('supertest');
const app = require('../src/app');
const users = require('../src/services/userStore');

beforeEach(() => users.reset());

describe('JWT authentication API', () => {
  test('registers a user and never returns a password hash', async () => {
    const r = await request(app).post('/api/auth/register').send({
      name: 'Alex Example', email: 'Alex@Example.com', password: 'StrongPass123!'
    });
    expect(r.status).toBe(201);
    expect(r.body.user.email).toBe('alex@example.com');
    expect(r.body.user.role).toBe('user');
    expect(r.body.user.passwordHash).toBeUndefined();
  });

  test('validates weak passwords and rejects duplicate email', async () => {
    expect((await request(app).post('/api/auth/register').send({
      name: 'Alex', email: 'alex@example.com', password: 'short'
    })).status).toBe(400);
    const body = { name: 'Alex Example', email: 'alex@example.com', password: 'StrongPass123!' };
    await request(app).post('/api/auth/register').send(body);
    expect((await request(app).post('/api/auth/register').send(body)).status).toBe(409);
  });

  test('login returns a token and valid token can access profile', async () => {
    const body = { name: 'Alex Example', email: 'alex@example.com', password: 'StrongPass123!' };
    await request(app).post('/api/auth/register').send(body);
    const login = await request(app).post('/api/auth/login').send({
      email: body.email, password: body.password
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
    const profile = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.user.email).toBe(body.email);
  });

  test('rejects incorrect credentials and missing token', async () => {
    const body = { name: 'Alex Example', email: 'alex@example.com', password: 'StrongPass123!' };
    await request(app).post('/api/auth/register').send(body);
    expect((await request(app).post('/api/auth/login').send({
      email: body.email, password: 'WrongPassword123!'
    })).status).toBe(401);
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });

  test('normal user cannot access admin endpoint', async () => {
    const body = { name: 'Alex Example', email: 'alex@example.com', password: 'StrongPass123!' };
    await request(app).post('/api/auth/register').send(body);
    const login = await request(app).post('/api/auth/login').send({
      email: body.email, password: body.password
    });
    expect((await request(app).get('/api/auth/admin')
      .set('Authorization', `Bearer ${login.body.token}`)).status).toBe(403);
  });

  test('client cannot choose admin role during registration', async () => {
    const r = await request(app).post('/api/auth/register').send({
      name: 'Bad Actor', email: 'bad@example.com', password: 'StrongPass123!', role: 'admin'
    });
    expect(r.status).toBe(201);
    expect(r.body.user.role).toBe('user');
  });
});
