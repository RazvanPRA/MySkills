import type { SessionFact } from '../model/facts';
import { accuracyByWeek, averageScore, fromFirstAnsweredWeek } from '../services/accuracy.service';
import { completedDays, computeStreak } from '../services/computeStreak.service';
import { suggestTopic } from '../services/suggestTopic.service';
import { weakTopics } from '../services/weakTopics.service';
import { catalog, covered } from './fixtures';

// 2026-11-10 is a Tuesday; its week started on Monday 2026-11-09.
const TODAY = '2026-11-10';

const session = (date: string, testKind: string, status: SessionFact['status']): SessionFact => ({
  id: `${date}-${testKind}`,
  date,
  testKind,
  status,
  exerciseCount: 5,
});

describe('completedDays', () => {
  const daily = new Set(['logic', 'knowledge']);

  it('needs every daily session of the day completed; a missing test does not block it', () => {
    const days = completedDays(
      [
        session('2026-11-08', 'logic', 'completed'),
        session('2026-11-08', 'knowledge', 'completed'),
        session('2026-11-09', 'logic', 'completed'),
        session('2026-11-09', 'knowledge', 'in_progress'),
        // Only the logic test had content that day.
        session('2026-11-10', 'logic', 'completed'),
      ],
      daily,
    );
    expect([...days].sort()).toEqual(['2026-11-08', '2026-11-10']);
  });

  it('ignores sessions of tests that are not daily (on-demand practice)', () => {
    const days = completedDays(
      [
        session('2026-11-10', 'practice', 'completed'),
        session('2026-11-09', 'practice', 'pending'),
      ],
      daily,
    );
    expect([...days]).toEqual([]);
  });
});

describe('computeStreak', () => {
  const streak = (completed: string[], firstDay: string | null = '2026-10-01') =>
    computeStreak({ completed: new Set(completed), firstDay, today: TODAY });

  it('is 0 before the first daily test', () => {
    expect(streak([], null)).toEqual({ days: 0, frozenDays: [], todayDone: false });
  });

  it('counts today once it is done; an unfinished today does not break the streak', () => {
    expect(streak(['2026-11-08', '2026-11-09', '2026-11-10'])).toMatchObject({
      days: 3,
      todayDone: true,
    });
    expect(streak(['2026-11-08', '2026-11-09'])).toMatchObject({ days: 2, todayDone: false });
  });

  it('bridges one missed day per week with the freeze', () => {
    const result = streak(['2026-11-05', '2026-11-06', '2026-11-08', '2026-11-09', '2026-11-10']);
    expect(result).toEqual({ days: 5, frozenDays: ['2026-11-07'], todayDone: true });
  });

  it('a second missed day in the same week ends the streak; unused freezes are not reported', () => {
    // From Tuesday: Monday 11-09 is frozen, then 11-08…11-06 count, 11-05 and 11-04 end it.
    expect(streak(['2026-11-03', '2026-11-06', '2026-11-07', '2026-11-08'], '2026-11-01')).toEqual({
      days: 3,
      frozenDays: ['2026-11-09'],
      todayDone: false,
    });
    const sunday = computeStreak({
      completed: new Set(['2026-11-03', '2026-11-06', '2026-11-07', '2026-11-08']),
      firstDay: '2026-11-01',
      today: '2026-11-08',
    });
    expect(sunday).toEqual({ days: 3, frozenDays: [], todayDone: true });
  });

  it('two missed days in different weeks are both covered', () => {
    // Sunday 11-08 (previous week) and Monday 11-09 (this week).
    expect(streak(['2026-11-06', '2026-11-07', '2026-11-10'])).toEqual({
      days: 3,
      frozenDays: ['2026-11-09', '2026-11-08'],
      todayDone: true,
    });
  });

  it('never reaches before the first day', () => {
    expect(streak(['2026-11-09', '2026-11-10'], '2026-11-09')).toEqual({
      days: 2,
      frozenDays: [],
      todayDone: true,
    });
  });
});

describe('accuracy', () => {
  const at = (day: number, score: number) => ({
    exerciseId: 'x',
    sessionId: 's',
    score,
    answeredAt: new Date(2026, 10, day, 9).toISOString(),
  });

  it('averageScore is a 0–100 mean, null without attempts', () => {
    expect(averageScore([])).toBeNull();
    expect(averageScore([at(9, 1), at(9, 0.5)])).toBe(75);
  });

  it('accuracyByWeek groups by local Monday–Sunday weeks, oldest first', () => {
    const weeks = accuracyByWeek([at(1, 0), at(3, 1), at(8, 0.5), at(9, 1), at(10, 0)], {
      today: TODAY,
      weeks: 3,
    });
    expect(weeks).toEqual([
      { weekStart: '2026-10-26', accuracy: 0, count: 1 },
      { weekStart: '2026-11-02', accuracy: 75, count: 2 },
      { weekStart: '2026-11-09', accuracy: 50, count: 2 },
    ]);
  });
});

describe('weakTopics', () => {
  it('lists attempted topics below 60%, weakest first, then lower level', () => {
    const mastery = new Map([
      ['react.c.mid', 30],
      ['react.a.junior', 30],
      ['react.b.junior', 80],
      ['logic.x.junior', 55],
      ['removed.topic', 10],
    ]);
    expect(weakTopics(catalog, mastery)).toEqual([
      { topicId: 'react.a.junior', mastery: 30 },
      { topicId: 'react.c.mid', mastery: 30 },
      { topicId: 'logic.x.junior', mastery: 55 },
    ]);
    expect(weakTopics(catalog, mastery, { limit: 1 })).toHaveLength(1);
  });
});

describe('suggestTopic', () => {
  it('suggests re-reading the weakest topic first', () => {
    const mastery = new Map([['react.c.mid', 40]]);
    expect(suggestTopic({ catalog, progress: {}, mastery })).toEqual({
      topicId: 'react.c.mid',
      reason: 'weak',
    });
  });

  it('otherwise the next knowledge topic whose prerequisites are covered, lowest level first', () => {
    const next = (progress: ReturnType<typeof covered>) =>
      suggestTopic({ catalog, progress, mastery: new Map() });
    expect(next({})).toEqual({ topicId: 'react.a.junior', reason: 'next' });
    expect(next(covered('react.a.junior', 'react.b.junior'))?.topicId).toBe('react.c.mid');
    // react.e.mid has no prerequisites; react.d.senior needs react.c.mid.
    expect(next(covered('react.a.junior', 'react.b.junior', 'react.c.mid'))?.topicId).toBe(
      'react.e.mid',
    );
    // Logic topics are never suggested: marking them does nothing.
    const all = covered(
      ...['a.junior', 'b.junior', 'c.mid', 'e.mid', 'd.senior'].map(t => `react.${t}`),
    );
    expect(next(all)).toBeNull();
  });
});

describe('fromFirstAnsweredWeek', () => {
  const week = (weekStart: string, count: number) => ({
    weekStart,
    count,
    accuracy: count === 0 ? null : 50,
  });

  it('starts at the first week with answers and keeps later empty weeks', () => {
    const weeks = [week('a', 0), week('b', 3), week('c', 0), week('d', 1)];
    expect(fromFirstAnsweredWeek(weeks).map(w => w.weekStart)).toEqual(['b', 'c', 'd']);
  });

  it('keeps only the current week when nothing was answered', () => {
    expect(fromFirstAnsweredWeek([week('a', 0), week('b', 0)]).map(w => w.weekStart)).toEqual([
      'b',
    ]);
    expect(fromFirstAnsweredWeek([])).toEqual([]);
  });
});
