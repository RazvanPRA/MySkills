import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiException } from '../common/api-exception';
import { TokensService } from './tokens.service';

type AuthenticatedRequest = Request & { userId?: string };

const unauthorized = () =>
  new ApiException('unauthorized', HttpStatus.UNAUTHORIZED, 'Missing or expired access token');

/** Requires `Authorization: Bearer <access token>`; puts the user id on the request. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    const userId = scheme === 'Bearer' && token ? await this.tokens.verifyAccess(token) : null;
    if (!userId) {
      throw unauthorized();
    }
    request.userId = userId;
    return true;
  }
}

/** The signed-in user's id, in a controller guarded by JwtAuthGuard. */
export const CurrentUserId = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const userId = context.switchToHttp().getRequest<AuthenticatedRequest>().userId;
  if (!userId) {
    throw unauthorized();
  }
  return userId;
});
