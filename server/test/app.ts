import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { loadEnv } from '../src/config/env';
import { PrismaService } from '../src/prisma/prisma.service';

/** The real app (all modules, real PostgreSQL), with optional configuration overrides. */
export async function createTestApp(overrides: Record<string, string> = {}) {
  const env = loadEnv({ AUTH_RATE_LIMIT_PER_MINUTE: '1000', ...process.env, ...overrides });
  const moduleRef = await Test.createTestingModule({ imports: [AppModule.forRoot(env)] }).compile();
  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();
  return { app, prisma: app.get(PrismaService) };
}

/** Deletes every row: tests start from an empty database. */
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}
