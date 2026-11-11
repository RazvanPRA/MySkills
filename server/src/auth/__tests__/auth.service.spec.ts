import { JwtService } from '@nestjs/jwt';
import type { Clock } from '../../common/clock';
import { loadEnv } from '../../config/env';
import { AuthService } from '../auth.service';
import {
  EmailTakenError,
  type RefreshTokensRepository,
  type UserRecord,
  type UsersRepository,
} from '../repositories/auth.repositories';
import type { StoredRefreshToken } from '../services/refresh-tokens';
import { TokensService } from '../tokens.service';

const env = loadEnv({
  DATABASE_URL: 'postgresql://unused@localhost/unused',
  JWT_ACCESS_SECRET: 'unit-test-secret-unit-test-secret-1234',
});

/** In-memory repositories with the same contract as the Prisma ones. */
function memoryRepositories() {
  const users: UserRecord[] = [];
  const tokens: (StoredRefreshToken & { tokenHash: string })[] = [];
  const usersRepo: UsersRepository = {
    findByEmail: async email => users.find(u => u.email === email) ?? null,
    findById: async id => users.find(u => u.id === id) ?? null,
    create: async ({ email, passwordHash }) => {
      if (users.some(u => u.email === email)) {
        throw new EmailTakenError();
      }
      const user = { id: `u${users.length + 1}`, email, passwordHash, createdAt: new Date() };
      users.push(user);
      return user;
    },
  };
  const tokensRepo: RefreshTokensRepository = {
    create: async t => {
      tokens.push({ ...t, id: `t${tokens.length + 1}`, revokedAt: null });
    },
    findByHash: async hash => tokens.find(t => t.tokenHash === hash) ?? null,
    markUsed: async (id, at) => {
      const found = tokens.find(t => t.id === id && t.revokedAt === null);
      if (found) {
        found.revokedAt = at;
      }
      return Boolean(found);
    },
    revokeFamily: async (familyId, at) => {
      for (const t of tokens) {
        if (t.familyId === familyId && !t.revokedAt) {
          t.revokedAt = at;
        }
      }
    },
  };
  return { usersRepo, tokensRepo, tokens };
}

function setup(now = new Date('2026-11-11T10:00:00.000Z')) {
  const clock: Clock = { now: () => now };
  const { usersRepo, tokensRepo, tokens } = memoryRepositories();
  const tokensService = new TokensService(new JwtService(), env, clock, tokensRepo);
  const auth = new AuthService(usersRepo, tokensRepo, clock, tokensService);
  return { auth, tokens, tokensService, setNow: (date: Date) => (now = date) };
}

const credentials = { email: 'ana@example.com', password: 'correct horse battery' };

describe('AuthService', () => {
  it('registers, then signs in with the same password', async () => {
    const { auth, tokensService } = setup();
    const registered = await auth.register(credentials);
    expect(registered.expiresIn).toBe(900);
    const signedIn = await auth.login(credentials);
    expect(await tokensService.verifyAccess(signedIn.accessToken)).toBe('u1');
  });

  it('rejects a second account with the same email', async () => {
    const { auth } = setup();
    await auth.register(credentials);
    await expect(auth.register(credentials)).rejects.toMatchObject({ code: 'email_taken' });
  });

  it('answers the same for a wrong password and an unknown email', async () => {
    const { auth } = setup();
    await auth.register(credentials);
    await expect(auth.login({ ...credentials, password: 'wrong password!' })).rejects.toMatchObject(
      { code: 'invalid_credentials' },
    );
    await expect(auth.login({ ...credentials, email: 'nobody@example.com' })).rejects.toMatchObject(
      { code: 'invalid_credentials' },
    );
  });

  it('rotates refresh tokens: each works once', async () => {
    const { auth } = setup();
    const first = await auth.register(credentials);
    const second = await auth.refresh(first.refreshToken);
    expect(second.refreshToken).not.toBe(first.refreshToken);
    expect((await auth.refresh(second.refreshToken)).refreshToken).toBeTruthy();
  });

  it('revokes the whole sign-in when a used token comes back', async () => {
    const { auth } = setup();
    const stolen = await auth.register(credentials);
    const legit = await auth.refresh(stolen.refreshToken);
    await expect(auth.refresh(stolen.refreshToken)).rejects.toMatchObject({
      code: 'invalid_refresh_token',
    });
    // The legitimate holder is signed out too: one of the two copies is a thief.
    await expect(auth.refresh(legit.refreshToken)).rejects.toMatchObject({
      code: 'invalid_refresh_token',
    });
  });

  it('keeps other sign-ins when one family is revoked', async () => {
    const { auth } = setup();
    const phone = await auth.register(credentials);
    const tablet = await auth.login(credentials);
    await auth.logout(phone.refreshToken);
    await expect(auth.refresh(phone.refreshToken)).rejects.toThrow();
    await expect(auth.refresh(tablet.refreshToken)).resolves.toBeTruthy();
  });

  it('rejects expired and unknown refresh tokens', async () => {
    const { auth, setNow } = setup();
    const pair = await auth.register(credentials);
    setNow(new Date('2026-12-12T10:00:00.000Z'));
    await expect(auth.refresh(pair.refreshToken)).rejects.toMatchObject({
      code: 'invalid_refresh_token',
    });
    await expect(auth.refresh('x'.repeat(43))).rejects.toMatchObject({
      code: 'invalid_refresh_token',
    });
  });

  it('stores only hashes of refresh tokens', async () => {
    const { auth, tokens } = setup();
    const pair = await auth.register(credentials);
    expect(tokens.map(t => t.tokenHash)).not.toContain(pair.refreshToken);
    expect(tokens[0]?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });
});
