import { type DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ApiKeyModule } from './api-key/api-key.module.js';
import { ApiExceptionFilter } from './common/api-exception.filter.js';
import { ConfigModule } from './config/config.module.js';
import type { Env } from './config/env.js';
import { HealthController } from './health/health.controller.js';
import { PingController } from './health/ping.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';

/** The whole API for a configuration (tests pass their own). */
@Module({})
export class AppModule {
  static forRoot(env: Env): DynamicModule {
    return {
      module: AppModule,
      imports: [ConfigModule.forRoot(env), PrismaModule, ApiKeyModule],
      controllers: [HealthController, PingController],
      providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
    };
  }
}
