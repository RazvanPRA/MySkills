import { knowledgeTest } from '../index';
import { buildKnowledgeSession } from '../services/buildKnowledgeSession.service';
import { buildKnowledgePool } from '../services/knowledgePool';
import { attempt, buildContext, card, catalog, categoryOf, covered, topicOf } from './fixtures';

const countBy = (ids: readonly string[], key: (id: string) => string) =>
  ids.reduce(
    (counts, id) => counts.set(key(id), (counts.get(key(id)) ?? 0) + 1),
    new Map<string, number>(),
  );

const PAST = (hour: number) => `2026-11-0${hour}T08:00:00.000Z`;

describe('knowledge pool', () => {
  it('contains only covered topics of categories that feed the knowledge test', () => {
    const progress = [
      ...covered(['react.t1.mid', 'logic.t1.mid']),
      { topicId: 'go.t1.mid', status: 'not_started' as const, updatedAt: PAST(1) },
      { topicId: 'sql.t1.mid', status: 'in_progress' as const, updatedAt: PAST(1) },
    ];
    const topics = new Set(
      buildKnowledgePool(buildContext({ progress })).map(item => item.topicId),
    );
    expect([...topics].sort()).toEqual(['react.t1.mid', 'sql.t1.mid']);
  });

  it('ignores progress for topics that no longer exist', () => {
    const progress = covered(['react.removed.mid']);
    expect(buildKnowledgePool(buildContext({ progress }))).toEqual([]);
  });

  it('honours an on-demand scope', () => {
    const pool = buildKnowledgePool(buildContext({ scope: { topicIds: ['go.t2.mid'] } }));
    expect(new Set(pool.map(item => item.topicId))).toEqual(new Set(['go.t2.mid']));
  });
});

describe('buildKnowledgeSession', () => {
  it('builds a full test of the configured length', () => {
    const plan = buildKnowledgeSession(buildContext());
    expect(plan.exerciseIds).toHaveLength(10);
    expect(new Set(plan.exerciseIds).size).toBe(10);
    expect(plan.shortfall).toBeUndefined();
  });

  it('follows the configured length (5 and 15)', () => {
    for (const length of [5, 15] as const) {
      const settings = { ...buildContext().settings, knowledgeTestLength: length };
      expect(buildKnowledgeSession(buildContext({ settings })).exerciseIds).toHaveLength(length);
    }
  });

  it('is deterministic for the same day and differs across seeds', () => {
    expect(buildKnowledgeSession(buildContext())).toEqual(buildKnowledgeSession(buildContext()));
    const plans = [1, 2, 3, 4].map(seed =>
      buildKnowledgeSession(buildContext({ seed })).exerciseIds.join(),
    );
    expect(new Set(plans).size).toBeGreaterThan(1);
  });

  it('reports a shortfall when nothing is covered', () => {
    expect(buildKnowledgeSession(buildContext({ progress: [] }))).toEqual({
      exerciseIds: [],
      shortfall: { target: 10, available: 0 },
    });
  });

  it('gives a shorter test with a shortfall when the pool is small', () => {
    const plan = buildKnowledgeSession(buildContext({ progress: covered(['react.t1.mid']) }));
    expect(plan.exerciseIds).toHaveLength(4);
    expect(plan.shortfall).toEqual({ target: 10, available: 4 });
  });

  it('starts with due reviews, most overdue first, at most 6', () => {
    const dueIds = [
      'react.t1.mid.q1',
      'go.t1.mid.q1',
      'sql.t1.mid.q1',
      'nestjs.t1.mid.q1',
      'react.t2.mid.q1',
      'go.t2.mid.q1',
      'sql.t2.mid.q1',
      'nestjs.t2.mid.q1',
    ];
    const reviewCards = dueIds.map((id, index) => card(id, `2026-11-0${index + 1}T08:00:00.000Z`));
    const plan = buildKnowledgeSession(buildContext({ reviewCards }));
    expect(plan.exerciseIds.slice(0, 6)).toEqual(dueIds.slice(0, 6));
    expect(plan.exerciseIds.filter(id => dueIds.includes(id))).toHaveLength(6);
  });

  it('never includes an exercise whose card is not due yet', () => {
    const notDue = card('react.t1.mid.q1', '2026-11-12T08:00:00.000Z');
    for (const seed of [1, 2, 3, 4, 5]) {
      const plan = buildKnowledgeSession(buildContext({ seed, reviewCards: [notDue] }));
      expect(plan.exerciseIds).not.toContain('react.t1.mid.q1');
    }
  });

  it('counts a card due later today as due', () => {
    const lateToday = new Date(2026, 10, 10, 23, 0).toISOString();
    const plan = buildKnowledgeSession(
      buildContext({ reviewCards: [card('go.t1.mid.q2', lateToday)] }),
    );
    expect(plan.exerciseIds[0]).toBe('go.t1.mid.q2');
  });

  it('ignores cards of exercises removed from the content', () => {
    const plan = buildKnowledgeSession(
      buildContext({ reviewCards: [card('react.gone.mid.q1', PAST(1))] }),
    );
    expect(plan.exerciseIds).not.toContain('react.gone.mid.q1');
    expect(plan.exerciseIds).toHaveLength(10);
  });

  it('ends with one stretch exercise (senior, difficulty ≥ 4)', () => {
    for (const seed of [1, 2, 3]) {
      const ids = buildKnowledgeSession(buildContext({ seed })).exerciseIds;
      const last = catalog.exercisesById.get(ids[ids.length - 1] ?? '');
      expect(last).toMatchObject({ level: 'senior' });
      expect(last?.difficulty).toBeGreaterThanOrEqual(4);
    }
  });

  it('keeps variety: at most 3 per category and no repeated topic when alternatives exist', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const ids = buildKnowledgeSession(buildContext({ seed })).exerciseIds;
      expect(Math.max(...countBy(ids, categoryOf).values())).toBeLessThanOrEqual(3);
      expect(Math.max(...countBy(ids, topicOf).values())).toBe(1);
    }
  });

  it('relaxes variety instead of shortening the test when one category is covered', () => {
    const progress = covered(['react.t1.mid', 'react.t2.mid', 'react.t3.senior']);
    const plan = buildKnowledgeSession(buildContext({ progress }));
    expect(plan.exerciseIds).toHaveLength(10);
    expect(plan.shortfall).toBeUndefined();
  });

  it('draws new exercises more often from weak categories', () => {
    const progress = covered(['react.t1.mid', 'react.t2.mid', 'go.t1.mid', 'go.t2.mid']);
    const recentAttempts = [attempt('react.t1.mid.q4', 0), attempt('go.t1.mid.q4', 1)];
    let weakFirst = 0;
    for (let seed = 1; seed <= 200; seed += 1) {
      const [first] = buildKnowledgeSession(
        buildContext({ seed, progress, recentAttempts }),
      ).exerciseIds;
      weakFirst += categoryOf(first ?? '') === 'react' ? 1 : 0;
    }
    // Weights 1.1 (accuracy 0) vs 0.1 (accuracy 1): react should come first ~92% of the time.
    expect(weakFirst).toBeGreaterThan(160);
  });
});

describe('knowledgeTest definition', () => {
  it('is a daily test that updates FSRS cards', () => {
    expect(knowledgeTest).toMatchObject({
      kind: 'knowledge',
      schedule: 'daily',
      spacedRepetition: true,
    });
    expect(knowledgeTest.buildSession).toBe(buildKnowledgeSession);
  });
});
