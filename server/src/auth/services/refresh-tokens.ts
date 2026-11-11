import { createHash, randomBytes } from 'node:crypto';

/** 256 bits of randomness, sent to the app once and never stored in clear. */
const REFRESH_TOKEN_BYTES = 32;

export const generateRefreshToken = (): string =>
  randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');

/**
 * SHA-256 is enough here (unlike passwords): the token is long and random, so a fast hash
 * cannot be brute-forced, and lookups by hash stay indexed.
 */
export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export type StoredRefreshToken = {
  id: string;
  userId: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type RefreshDecision = 'ok' | 'unknown' | 'reused' | 'expired';

/**
 * Pure. A token that was already rotated (or revoked) is "reused": someone holds a copy, so the
 * caller revokes the whole family and both the thief and the user must sign in again.
 */
export function decideRefresh(token: StoredRefreshToken | null, now: Date): RefreshDecision {
  if (!token) {
    return 'unknown';
  }
  if (token.revokedAt) {
    return 'reused';
  }
  return token.expiresAt.getTime() <= now.getTime() ? 'expired' : 'ok';
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const refreshExpiry = (now: Date, days: number): Date =>
  new Date(now.getTime() + days * DAY_MS);
