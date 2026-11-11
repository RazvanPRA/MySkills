import {
  decideRefresh,
  generateRefreshToken,
  hashToken,
  refreshExpiry,
  type StoredRefreshToken,
} from '../services/refresh-tokens.js';

const NOW = new Date('2026-11-11T10:00:00.000Z');

const token = (overrides: Partial<StoredRefreshToken> = {}): StoredRefreshToken => ({
  id: 't1',
  userId: 'u1',
  familyId: 'f1',
  expiresAt: new Date('2026-12-11T10:00:00.000Z'),
  revokedAt: null,
  ...overrides,
});

describe('refresh tokens', () => {
  it('generates long, unique, URL-safe tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, generateRefreshToken));
    expect(tokens.size).toBe(100);
    for (const value of tokens) {
      expect(value).toMatch(/^[A-Za-z0-9_-]{43}$/);
    }
  });

  it('stores a stable SHA-256 hash, never the token', () => {
    expect(hashToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('expires after the configured number of days', () => {
    expect(refreshExpiry(NOW, 30).toISOString()).toBe('2026-12-11T10:00:00.000Z');
  });

  it.each([
    ['unknown', null],
    ['ok', token()],
    ['reused', token({ revokedAt: new Date('2026-11-10T10:00:00.000Z') })],
    ['expired', token({ expiresAt: NOW })],
  ] as const)('decides %s', (decision, stored) => {
    expect(decideRefresh(stored, NOW)).toBe(decision);
  });

  it('treats a used token as reused even after it expired', () => {
    const stale = token({ expiresAt: new Date('2026-11-01T00:00:00.000Z'), revokedAt: NOW });
    expect(decideRefresh(stale, NOW)).toBe('reused');
  });
});
