import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { Credentials, TokenPair } from '@senior-prep/contracts';
import { ApiException, invalidCredentials, invalidRefreshToken } from '../common/api-exception.js';
import { CLOCK, type Clock } from '../common/clock.js';
import {
  EmailTakenError,
  REFRESH_TOKENS_REPOSITORY,
  type RefreshTokensRepository,
  USERS_REPOSITORY,
  type UsersRepository,
} from './repositories/auth.repositories.js';
import { dummyPasswordHash, hashPassword, verifyPassword } from './services/passwords.js';
import { decideRefresh, hashToken } from './services/refresh-tokens.js';
import { TokensService } from './tokens.service.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(REFRESH_TOKENS_REPOSITORY) private readonly refreshTokens: RefreshTokensRepository,
    @Inject(CLOCK) private readonly clock: Clock,
    private readonly tokens: TokensService,
  ) {}

  async register({ email, password }: Credentials): Promise<TokenPair> {
    try {
      const user = await this.users.create({ email, passwordHash: await hashPassword(password) });
      return await this.tokens.issue(user.id);
    } catch (error) {
      if (error instanceof EmailTakenError) {
        throw new ApiException('email_taken', HttpStatus.CONFLICT, 'Email already registered');
      }
      throw error;
    }
  }

  /** Same answer and similar timing for an unknown email and a wrong password. */
  async login({ email, password }: Credentials): Promise<TokenPair> {
    const user = await this.users.findByEmail(email);
    const valid = await verifyPassword(user?.passwordHash ?? (await dummyPasswordHash()), password);
    if (!user || !valid) {
      throw invalidCredentials();
    }
    return this.tokens.issue(user.id);
  }

  /** Rotation with reuse detection: every refresh token works exactly once. */
  async refresh(refreshToken: string): Promise<TokenPair> {
    const now = this.clock.now();
    const stored = await this.refreshTokens.findByHash(hashToken(refreshToken));
    const decision = decideRefresh(stored, now);
    if (decision === 'reused' && stored) {
      await this.refreshTokens.revokeFamily(stored.familyId, now);
    }
    if (decision !== 'ok' || !stored) {
      throw invalidRefreshToken();
    }
    // Lost race: the same token was just used by another request, which counts as reuse.
    if (!(await this.refreshTokens.markUsed(stored.id, now))) {
      await this.refreshTokens.revokeFamily(stored.familyId, now);
      throw invalidRefreshToken();
    }
    return this.tokens.issue(stored.userId, stored.familyId);
  }

  /** Ends this sign-in: every token of its family stops working. Unknown tokens are ignored. */
  async logout(refreshToken: string): Promise<void> {
    const stored = await this.refreshTokens.findByHash(hashToken(refreshToken));
    if (stored) {
      await this.refreshTokens.revokeFamily(stored.familyId, this.clock.now());
    }
  }
}
