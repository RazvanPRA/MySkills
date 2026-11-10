import { createTestDatabase } from '@/db/testing/createTestDatabase';
import { createLocalUserDataRepository } from '../repository/LocalUserDataRepository';
import { snapshot } from './fixtures';

/** The fixture's single attempt, as a template. */
const [attempt] = snapshot('a').attempts;
if (!attempt) {
  throw new Error('fixture needs an attempt');
}

async function setup() {
  const { db } = await createTestDatabase();
  return createLocalUserDataRepository(db);
}

describe('LocalUserDataRepository', () => {
  it('is empty on a fresh database', async () => {
    const repo = await setup();
    expect(await repo.readAll()).toEqual({
      topicProgress: [],
      reviewCards: [],
      sessions: [],
      attempts: [],
    });
  });

  it('replaces everything and reads it back unchanged', async () => {
    const repo = await setup();
    await repo.replaceAll(snapshot('a'));
    await repo.replaceAll(snapshot('b'));
    expect(await repo.readAll()).toEqual(snapshot('b'));
  });

  it('writes large tables in chunks', async () => {
    const repo = await setup();
    const big = snapshot('a');
    big.attempts = Array.from({ length: 250 }, (_, i) => ({
      ...attempt,
      id: `a-${String(i).padStart(3, '0')}`,
      answeredAt: `2026-11-10T08:${String(i % 60).padStart(2, '0')}:00.000Z`,
    }));
    await repo.replaceAll(big);
    expect((await repo.readAll()).attempts).toHaveLength(250);
  });

  it('is all or nothing: a failing replace keeps the previous data', async () => {
    const repo = await setup();
    await repo.replaceAll(snapshot('a'));
    const broken = snapshot('b');
    broken.attempts = [{ ...attempt, sessionId: 'missing' }];
    await expect(repo.replaceAll(broken)).rejects.toThrow();
    expect(await repo.readAll()).toEqual(snapshot('a'));
  });

  it('clears every table', async () => {
    const repo = await setup();
    await repo.replaceAll(snapshot('a'));
    await repo.clearAll();
    expect(Object.values(await repo.readAll()).every(rows => rows.length === 0)).toBe(true);
  });
});
