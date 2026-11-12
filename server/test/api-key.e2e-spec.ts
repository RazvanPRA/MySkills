import type { INestApplication } from '@nestjs/common';
import { apiErrorSchema, apiKeyHeader, pingResponseSchema } from '@senior-prep/contracts';
import request from 'supertest';
import type { Env } from '../src/config/env.js';
import { createTestApp } from './app.js';

describe('api key (e2e)', () => {
  let app: INestApplication;
  let env: Env;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    ({ app, env } = await createTestApp());
  });
  afterAll(() => app.close());

  it('reports health without a key, including the database', async () => {
    await http().get('/health').expect(200, { status: 'ok', database: 'ok' });
  });

  it('answers a request that carries the key', async () => {
    const res = await http().get('/ping').set(apiKeyHeader, env.API_KEY).expect(200);
    expect(pingResponseSchema.parse(res.body)).toEqual({ status: 'ok' });
  });

  it('refuses a missing or wrong key with the shared error shape', async () => {
    const missing = await http().get('/ping').expect(401);
    expect(apiErrorSchema.parse(missing.body).code).toBe('unauthorized');
    const wrong = await http().get('/ping').set(apiKeyHeader, `${env.API_KEY}x`).expect(401);
    expect(wrong.body.code).toBe('unauthorized');
  });

  it('does not accept the key as a bearer token or query parameter', async () => {
    await http().get('/ping').set('Authorization', `Bearer ${env.API_KEY}`).expect(401);
    await http().get(`/ping?${apiKeyHeader}=${env.API_KEY}`).expect(401);
  });
});
