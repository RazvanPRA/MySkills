import type { INestApplication } from '@nestjs/common';
import { apiErrorSchema, meSchema, tokenPairSchema } from '@senior-prep/contracts';
import request from 'supertest';
import type { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, resetDatabase } from './app.js';

const credentials = { email: 'Ana@Example.com', password: 'correct horse battery' };

describe('auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });
  beforeEach(() => resetDatabase(prisma));
  afterAll(() => app.close());

  it('reports health, including the database', async () => {
    await http().get('/health').expect(200, { status: 'ok', database: 'ok' });
  });

  it('registers, reads /me with the access token, and normalizes the email', async () => {
    const res = await http().post('/auth/register').send(credentials).expect(201);
    const pair = tokenPairSchema.parse(res.body);
    const me = await http()
      .get('/me')
      .set('Authorization', `Bearer ${pair.accessToken}`)
      .expect(200);
    expect(meSchema.parse(me.body).email).toBe('ana@example.com');
  });

  it('answers with the shared error shape', async () => {
    await http().post('/auth/register').send(credentials).expect(201);
    const taken = await http().post('/auth/register').send(credentials).expect(409);
    expect(apiErrorSchema.parse(taken.body).code).toBe('email_taken');
    const invalid = await http().post('/auth/register').send({ email: 'x', password: 'y' });
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe('validation_failed');
    const wrong = await http()
      .post('/auth/login')
      .send({ ...credentials, password: 'wrong password!!' })
      .expect(401);
    expect(wrong.body.code).toBe('invalid_credentials');
    await http().get('/me').expect(401);
    await http().get('/me').set('Authorization', 'Bearer not-a-jwt').expect(401);
  });

  it('rotates refresh tokens and revokes the sign-in when an old one is reused', async () => {
    const first = (await http().post('/auth/register').send(credentials)).body;
    const second = (
      await http().post('/auth/refresh').send({ refreshToken: first.refreshToken }).expect(200)
    ).body;
    await http().post('/auth/refresh').send({ refreshToken: first.refreshToken }).expect(401);
    await http().post('/auth/refresh').send({ refreshToken: second.refreshToken }).expect(401);
    expect(await prisma.refreshToken.count({ where: { revokedAt: null } })).toBe(0);
  });

  it('only one of two concurrent refreshes with the same token succeeds', async () => {
    const pair = (await http().post('/auth/register').send(credentials)).body;
    const results = await Promise.all(
      [1, 2].map(() => http().post('/auth/refresh').send({ refreshToken: pair.refreshToken })),
    );
    expect(results.map(r => r.status).sort()).toContain(401);
    expect(results.filter(r => r.status === 200).length).toBeLessThanOrEqual(1);
  });

  it('logs out one sign-in only', async () => {
    const phone = (await http().post('/auth/register').send(credentials)).body;
    const tablet = (await http().post('/auth/login').send(credentials).expect(200)).body;
    await http().post('/auth/logout').send({ refreshToken: phone.refreshToken }).expect(204);
    await http().post('/auth/refresh').send({ refreshToken: phone.refreshToken }).expect(401);
    await http().post('/auth/refresh').send({ refreshToken: tablet.refreshToken }).expect(200);
  });
});

describe('auth rate limit (e2e)', () => {
  it('slows down repeated sign-in attempts', async () => {
    const { app, prisma } = await createTestApp({ AUTH_RATE_LIMIT_PER_MINUTE: '3' });
    await resetDatabase(prisma);
    const attempt = () => request(app.getHttpServer()).post('/auth/login').send(credentials);
    const statuses = [];
    for (let i = 0; i < 4; i += 1) {
      statuses.push((await attempt()).status);
    }
    expect(statuses).toEqual([401, 401, 401, 429]);
    await app.close();
  });
});
