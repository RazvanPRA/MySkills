import { createTestDatabase } from '@/db/testing/createTestDatabase';
import type { Attempt } from '../model/attempt';
import { createLocalAttemptRepository } from '../repository/LocalAttemptRepository';

const attempt = (id: string, answeredAt: string, extra: Partial<Attempt> = {}): Attempt => ({
  id,
  sessionId: 's1',
  exerciseId: 'react.q1',
  answer: { selected: [0, 2] },
  result: { correct: false, score: 0.5, feedback: { ro: 'Parțial corect (1/2)' } },
  durationMs: 41000,
  answeredAt,
  ...extra,
});

async function setup() {
  const { db, sqlite } = await createTestDatabase();
  // Attempts reference a session (foreign key).
  sqlite
    .prepare(
      "insert into daily_sessions (id, date, test_kind, exercise_ids, status) values ('s1', '2026-11-10', 'knowledge', '[]', 'in_progress'), ('s2', '2026-11-09', 'logic', '[]', 'completed')",
    )
    .run();
  return { repo: createLocalAttemptRepository(db), sqlite };
}

describe('LocalAttemptRepository', () => {
  it('round-trips answer and result JSON, with and without confidence', async () => {
    const { repo } = await setup();
    const withRating = attempt('a1', '2026-11-10T07:01:00.000Z', { confidence: 3 });
    const withoutRating = attempt('a2', '2026-11-10T07:02:00.000Z', { answer: 'B' });
    await repo.add(withRating);
    await repo.add(withoutRating);
    expect(await repo.listBySession('s1')).toEqual([withRating, withoutRating]);
  });

  it('lists attempts since a moment, across sessions, oldest first', async () => {
    const { repo } = await setup();
    await repo.add(attempt('new', '2026-11-10T07:00:00.000Z'));
    await repo.add(attempt('old', '2026-10-01T07:00:00.000Z', { sessionId: 's2' }));
    await repo.add(attempt('mid', '2026-11-09T07:00:00.000Z', { sessionId: 's2' }));
    const ids = (await repo.listSince('2026-10-27T00:00:00.000Z')).map(a => a.id);
    expect(ids).toEqual(['mid', 'new']);
  });

  it('deletes attempts together with their session', async () => {
    const { repo, sqlite } = await setup();
    await repo.add(attempt('a1', '2026-11-10T07:01:00.000Z'));
    sqlite.prepare("delete from daily_sessions where id = 's1'").run();
    expect(await repo.listBySession('s1')).toEqual([]);
  });
});
