import {
  type CanActivate,
  type ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { apiKeyHeader } from '@senior-prep/contracts';
import type { Request } from 'express';
import { ApiException } from '../common/api-exception.js';
import { type Env, ENV } from '../config/env.js';
import { IS_PUBLIC } from './public.decorator.js';
import { apiKeyMatches } from './services/api-key-matches.js';

/** Global guard: every route needs the `x-api-key` header unless it is marked @Public(). */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@Inject(ENV) private readonly env: Env, private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) {
      return true;
    }
    const header = context.switchToHttp().getRequest<Request>().headers[apiKeyHeader];
    if (!apiKeyMatches(this.env.API_KEY, typeof header === 'string' ? header : undefined)) {
      throw new ApiException('unauthorized', HttpStatus.UNAUTHORIZED, 'Missing or wrong API key');
    }
    return true;
  }
}
