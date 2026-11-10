import { defaultUserSettings } from '@/features/settings';
import { logicTest } from '../index';
import { buildLogicSession } from '../services/buildLogicSession.service';
import {
  attempt,
  buildContext,
  difficultyOf,
  LOGIC_IDS,
  logicCatalog,
  mean,
  subcategoryOfId,
} from './fixtures';

const subcategories = (ids: readonly string[]) => new Set(ids.map(subcategoryOfId));

describe('buildLogicSession', () => {
  it('builds a full test of the configured length from logic exercises only', () => {
    const plan = buildLogicSession(buildContext());
    expect(plan.exerciseIds).toHaveLength(5);
    expect(plan.shortfall).toBeUndefined();
    plan.exerciseIds.forEach(id => expect(LOGIC_IDS).toContain(id));
  });

  it('honours the logic test length setting', () => {
    const settings = { ...defaultUserSettings, logicTestLength: 8 as const };
    expect(buildLogicSession(buildContext({ settings })).exerciseIds).toHaveLength(8);
  });

  it('is deterministic for a seed and varies between days', () => {
    const plans = [7, 7, 8, 9, 10].map(
      seed => buildLogicSession(buildContext({ seed })).exerciseIds,
    );
    expect(plans[1]).toEqual(plans[0]);
    expect(new Set(plans.map(ids => ids.join())).size).toBeGreaterThan(1);
  });

  it('covers at least 3 subcategories and orders problems from easiest to hardest', () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { exerciseIds } = buildLogicSession(buildContext({ seed }));
      expect(subcategories(exerciseIds).size).toBeGreaterThanOrEqual(3);
      const difficulties = exerciseIds.map(difficultyOf);
      expect(difficulties).toEqual([...difficulties].sort((a, b) => a - b));
    }
  });

  it('starts around difficulty 2.5 without history', () => {
    const { exerciseIds } = buildLogicSession(buildContext());
    expect(mean(exerciseIds.map(difficultyOf))).toBeCloseTo(2.6, 0);
  });

  it('raises the difficulty after a strong week and lowers it after a weak one', () => {
    const served = ['logic.trace.mid.q1', 'logic.sql.mid.q1', 'logic.puzzles.mid.q1'];
    const week = (score: number) => served.map(id => attempt(id, { score, daysAgo: 2 }));
    const average = (score: number) =>
      mean(
        buildLogicSession(buildContext({ recentAttempts: week(score) })).exerciseIds.map(
          difficultyOf,
        ),
      );
    expect(average(1)).toBeGreaterThan(3);
    expect(average(0)).toBeLessThan(3);
  });

  it('ignores accuracy older than 7 days', () => {
    const old = LOGIC_IDS.slice(0, 3).map(id => attempt(id, { score: 1, daysAgo: 8 }));
    const fresh = buildLogicSession(buildContext()).exerciseIds;
    const withOld = buildLogicSession(buildContext({ recentAttempts: old })).exerciseIds;
    expect(mean(withOld.map(difficultyOf))).toBeCloseTo(mean(fresh.map(difficultyOf)), 0);
  });

  it('does not repeat a problem seen in the last 30 days while fresh ones exist', () => {
    const seenIds = LOGIC_IDS.filter((_, index) => index % 2 === 0);
    const recentAttempts = seenIds.map((id, index) => attempt(id, { daysAgo: 1 + (index % 25) }));
    const { exerciseIds } = buildLogicSession(buildContext({ recentAttempts }));
    expect(exerciseIds).toHaveLength(5);
    exerciseIds.forEach(id => expect(seenIds).not.toContain(id));
  });

  it('once the pool is used up, stays full with the least recently seen problems', () => {
    const [fresh, ...seen] = LOGIC_IDS;
    const recentAttempts = seen.map((id, index) => attempt(id, { daysAgo: 1 + (index % 29) }));
    const { exerciseIds, shortfall } = buildLogicSession(buildContext({ recentAttempts }));
    expect(shortfall).toBeUndefined();
    expect(exerciseIds).toHaveLength(5);
    expect(exerciseIds).toContain(fresh);
    const oldest = seen.filter((_, index) => index % 29 >= 25);
    exerciseIds.filter(id => id !== fresh).forEach(id => expect(oldest).toContain(id));
  });

  it('gives a shorter test without a remedy when the pool is too small', () => {
    const tiny = logicCatalog({ subcategories: ['trace'], levels: ['mid'] });
    const plan = buildLogicSession(buildContext({ catalog: tiny }));
    expect(plan.exerciseIds).toHaveLength(3);
    expect(plan.shortfall).toEqual({ target: 5, available: 3 });
  });

  it('gives an empty plan when there is no logic content', () => {
    const none = logicCatalog({ subcategories: [] });
    expect(buildLogicSession(buildContext({ catalog: none }))).toEqual({
      exerciseIds: [],
      shortfall: { target: 5, available: 0 },
    });
  });

  it('uses every subcategory a small pool has', () => {
    const two = logicCatalog({ subcategories: ['trace', 'sql'] });
    const { exerciseIds } = buildLogicSession(buildContext({ catalog: two }));
    expect(subcategories(exerciseIds)).toEqual(new Set(['logic.trace', 'logic.sql']));
  });
});

describe('logicTest definition', () => {
  it('is a daily test without spaced repetition', () => {
    expect(logicTest).toMatchObject({
      kind: 'logic',
      title: { ro: 'Test de logică', en: 'Logic test' },
      schedule: 'daily',
      spacedRepetition: false,
    });
    expect(logicTest.buildSession).toBe(buildLogicSession);
  });
});
