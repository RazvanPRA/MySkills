import { createTestDatabase } from '@/db/testing/createTestDatabase';
import type { DailySession } from '../model/dailySession';
import { createLocalSessionRepository } from '../repository/LocalSessionRepository';

const session = (extra: Partial<DailySession> = {}): DailySession => ({
  id: 's1',
  date: '2026-11-10',
  testKind: 'knowledge',
  exerciseIds: ['react.q1', 'go.q7'],
  status: 'pending',
  ...extra,
});

async function setup() {
  const { db } = await createTestDatabase();
  return createLocalSessionRepository(db);
}

describe('LocalSessionRepository', () => {
  it('finds the session of a day and test kind (resume on reopen)', async () => {
    const repo = await setup();
    await repo.save(session());
    expect(await repo.findByDateAndKind('2026-11-10', 'knowledge')).toEqual(session());
    expect(await repo.findByDateAndKind('2026-11-10', 'logic')).toBeNull();
  });

  it('keeps exerciseIds order through the JSON column', async () => {
    const repo = await setup();
    await repo.save(session({ exerciseIds: ['c', 'a', 'b'] }));
    expect((await repo.getById('s1'))?.exerciseIds).toEqual(['c', 'a', 'b']);
  });

  it('updates status, timestamps and score as the session progresses', async () => {
    const repo = await setup();
    await repo.save(session());
    const done = session({
      status: 'completed',
      startedAt: '2026-11-10T07:00:00.000Z',
      completedAt: '2026-11-10T07:12:00.000Z',
      score: 0.8,
    });
    await repo.save(done);
    expect(await repo.getById('s1')).toEqual(done);
  });

  it('rejects a second session for the same day and kind', async () => {
    const repo = await setup();
    await repo.save(session());
    // Drizzle wraps the driver error; the SQLite message is kept as `cause`.
    await expect(repo.save(session({ id: 's2' }))).rejects.toMatchObject({
      cause: expect.objectContaining({ message: expect.stringMatching(/UNIQUE/) }),
    });
  });

  it('lists sessions in a date range, oldest first', async () => {
    const repo = await setup();
    await repo.save(session({ id: 'a', date: '2026-11-08' }));
    await repo.save(session({ id: 'b', date: '2026-11-10', testKind: 'logic' }));
    await repo.save(session({ id: 'c', date: '2026-11-09' }));
    await repo.save(session({ id: 'd', date: '2026-10-01' }));
    const ids = (await repo.listBetween('2026-11-08', '2026-11-10')).map(s => s.id);
    expect(ids).toEqual(['a', 'c', 'b']);
  });
});
