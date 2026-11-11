import 'reflect-metadata';
import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule.forRoot(env));
  app.enableShutdownHooks();
  await app.listen(env.PORT);
  Logger.log(`Senior Prep API on http://localhost:${env.PORT}`, 'Bootstrap');
}

void bootstrap();
