import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { loadEnv } from '../src/config/env.js';

/** The real app (all modules, real PostgreSQL), with optional configuration overrides. */
export async function createTestApp(overrides: Record<string, string> = {}) {
  const env = loadEnv({ ...process.env, ...overrides });
  const moduleRef = await Test.createTestingModule({ imports: [AppModule.forRoot(env)] }).compile();
  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();
  return { app, env };
}
