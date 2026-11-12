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

describe('LocalSessionRepository on-demand sessions', () => {
  const practice = (id: string, extra: Partial<DailySession> = {}) =>
    session({ id, testKind: 'practice', scope: { topicIds: ['react.hooks'] }, ...extra });

  it('round-trips the scope and keeps daily lookups free of on-demand sessions', async () => {
    const repo = await setup();
    await repo.save(practice('p1'));
    expect(await repo.getById('p1')).toEqual(practice('p1'));
    expect(await repo.findByDateAndKind('2026-11-10', 'practice')).toBeNull();
  });

  it('allows several on-demand sessions of a kind per day, but one daily session', async () => {
    const repo = await setup();
    await repo.save(practice('p1', { status: 'completed' }));
    await repo.save(practice('p2'));
    expect((await repo.listBetween('2026-11-10', '2026-11-10')).map(s => s.id)).toEqual([
      'p1',
      'p2',
    ]);
    await repo.save(session({ id: 'd1' }));
    // Drizzle wraps the SQLite error; the original is the cause.
    await expect(repo.save(session({ id: 'd2' }))).rejects.toMatchObject({
      cause: expect.objectContaining({ message: expect.stringMatching(/UNIQUE/) }),
    });
  });

  it('finds the unfinished session with the same scope to resume it', async () => {
    const repo = await setup();
    await repo.save(practice('done', { status: 'completed' }));
    expect(await repo.findOpenByScope(query())).toBeNull();
    await repo.save(practice('open', { status: 'in_progress' }));
    await repo.save(practice('other', { scope: { topicIds: ['go.channels'] } }));
    expect((await repo.findOpenByScope(query()))?.id).toBe('open');
    expect(await repo.findOpenByScope({ ...query(), date: '2026-11-11' })).toBeNull();

    function query() {
      return { date: '2026-11-10', testKind: 'practice', scope: { topicIds: ['react.hooks'] } };
    }
  });
});
