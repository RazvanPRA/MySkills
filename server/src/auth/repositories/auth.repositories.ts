import type { StoredRefreshToken } from '../services/refresh-tokens.js';

export type UserRecord = { id: string; email: string; passwordHash: string; createdAt: Date };

/** Thrown by `create` when the email already has an account. */
export class EmailTakenError extends Error {
  constructor() {
    super('Email already registered');
  }
}

export type UsersRepository = {
  findByEmail: (email: string) => Promise<UserRecord | null>;
  findById: (id: string) => Promise<UserRecord | null>;
  create: (user: { email: string; passwordHash: string }) => Promise<UserRecord>;
};

export type RefreshTokensRepository = {
  create: (token: {
    userId: string;
    familyId: string;
    tokenHash: string;
    expiresAt: Date;
  }) => Promise<void>;
  findByHash: (tokenHash: string) => Promise<StoredRefreshToken | null>;
  /**
   * Marks the token used, atomically: false when it was already used, so two concurrent
   * refreshes with the same token cannot both succeed.
   */
  markUsed: (id: string, at: Date) => Promise<boolean>;
  revokeFamily: (familyId: string, at: Date) => Promise<void>;
};

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
export const REFRESH_TOKENS_REPOSITORY = Symbol('REFRESH_TOKENS_REPOSITORY');
