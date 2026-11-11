import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenPair } from '@senior-prep/contracts';
import { CLOCK, type Clock } from '../common/clock';
import { type Env, ENV } from '../config/env';
import {
  REFRESH_TOKENS_REPOSITORY,
  type RefreshTokensRepository,
} from './repositories/auth.repositories';
import { generateRefreshToken, hashToken, refreshExpiry } from './services/refresh-tokens';

export type AccessClaims = { sub: string };

/** Issues access JWTs and rotating refresh tokens. */
@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(ENV) private readonly env: Env,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(REFRESH_TOKENS_REPOSITORY) private readonly refreshTokens: RefreshTokensRepository,
  ) {}

  /** A new pair; `familyId` continues a sign-in on refresh, a new sign-in starts a family. */
  async issue(userId: string, familyId: string = randomUUID()): Promise<TokenPair> {
    const refreshToken = generateRefreshToken();
    await this.refreshTokens.create({
      userId,
      familyId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiry(this.clock.now(), this.env.REFRESH_TOKEN_TTL_DAYS),
    });
    const claims: AccessClaims = { sub: userId };
    const accessToken = await this.jwt.signAsync(claims, {
      secret: this.env.JWT_ACCESS_SECRET,
      expiresIn: this.env.ACCESS_TOKEN_TTL_SECONDS,
    });
    return { accessToken, expiresIn: this.env.ACCESS_TOKEN_TTL_SECONDS, refreshToken };
  }

  /** The user id of a valid access token, or null. */
  async verifyAccess(token: string): Promise<string | null> {
    try {
      const claims = await this.jwt.verifyAsync<AccessClaims>(token, {
        secret: this.env.JWT_ACCESS_SECRET,
      });
      return claims.sub;
    } catch {
      return null;
    }
  }
}
