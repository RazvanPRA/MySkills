import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard.js';

/** Protects the whole API with the key from .env. Routes opt out with @Public(). */
@Module({ providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }] })
export class ApiKeyModule {}
