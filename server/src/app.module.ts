import { type DynamicModule, Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { CLOCK, type Clock, systemClock } from './common/clock';
import { ConfigModule } from './config/config.module';
import type { Env } from './config/env';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

const MINUTE_MS = 60_000;

@Global()
@Module({})
class ClockModule {
  static forRoot(clock: Clock): DynamicModule {
    return {
      module: ClockModule,
      providers: [{ provide: CLOCK, useValue: clock }],
      exports: [CLOCK],
    };
  }
}

/** The whole API for a configuration (and, in tests, a fixed clock). */
@Module({})
export class AppModule {
  static forRoot(env: Env, clock: Clock = systemClock): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot(env),
        ClockModule.forRoot(clock),
        PrismaModule,
        ThrottlerModule.forRoot([{ ttl: MINUTE_MS, limit: env.AUTH_RATE_LIMIT_PER_MINUTE }]),
        AuthModule,
      ],
      controllers: [HealthController],
      providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
    };
  }
}
