import type { createTestDependencies } from '../testing/createTestDependencies';

type Sqlite = Awaited<ReturnType<typeof createTestDependencies>>['sqlite'];

/**
 * Two finished logic tests for the logic fixture pack: Nov 8 (100%) and Nov 9 (50%, one right
 * answer on "trace" and one wrong on "debugging"). The test clock is Nov 10.
 */
export function seedLogicHistory(sqlite: Sqlite) {
  const session = sqlite.prepare(
    "insert into daily_sessions (id, date, test_kind, exercise_ids, status, score) values (?, ?, 'logic', ?, 'completed', ?)",
  );
  session.run('s8', '2026-11-08', '[]', 1);
  session.run(
    's9',
    '2026-11-09',
    JSON.stringify(['logic.trace.mid.q1', 'logic.debugging.mid.q1']),
    0.5,
  );
  const attempt = sqlite.prepare(
    "insert into attempts (id, session_id, exercise_id, answer, result, duration_ms, answered_at) values (?, 's9', ?, 'null', ?, 1000, ?)",
  );
  attempt.run(
    'a1',
    'logic.trace.mid.q1',
    JSON.stringify({ correct: true, score: 1 }),
    '2026-11-09T12:00:00.000Z',
  );
  attempt.run(
    'a2',
    'logic.debugging.mid.q1',
    JSON.stringify({ correct: false, score: 0 }),
    '2026-11-09T12:01:00.000Z',
  );
}
