import { rankByFreshness } from '../services/freshness';
import { buildLogicPool, subcategoryOf } from '../services/logicPool';
import { slotTargets } from '../services/pickLogicProblems';
import { targetDifficulty } from '../services/targetDifficulty';
import { attempt, catalog, LOGIC_IDS } from './fixtures';

describe('logic pool', () => {
  it('strips the level from a topic id to get its subcategory', () => {
    expect(subcategoryOf({ id: 'logic.event-loop.mid', level: 'mid' })).toBe('logic.event-loop');
    expect(subcategoryOf({ id: 'logic.puzzles', level: 'junior' })).toBe('logic.puzzles');
  });

  it('holds every exercise of logic categories and nothing else', () => {
    const pool = buildLogicPool(catalog);
    expect(pool.map(item => item.id).sort()).toEqual([...LOGIC_IDS].sort());
    expect(pool.find(item => item.id === 'logic.sql.senior.q3')).toEqual({
      id: 'logic.sql.senior.q3',
      topicId: 'logic.sql.senior',
      subcategory: 'logic.sql',
      difficulty: 5,
    });
  });
});

describe('targetDifficulty', () => {
  const answered = (difficulty: number, scores: readonly number[]) =>
    scores.map(score => ({ difficulty, score }));

  it.each([
    ['no history: the default', [], 2.5],
    ['above 80%: up 0.5', answered(3, [1, 1, 1, 1, 1]), 3.5],
    ['below 70%: down 0.5', answered(3, [1, 0, 0, 1]), 2.5],
    ['inside 70–80%: unchanged', answered(3, [1, 1, 1, 0]), 3],
    ['exactly 80% stays', answered(2, [1, 1, 1, 1, 0]), 2],
    ['exactly 70% stays', answered(2, [1, 1, 1, 1, 1, 1, 1, 0, 0, 0]), 2],
    ['capped at 5', answered(5, [1, 1]), 5],
    ['floored at 1', answered(1, [0, 0]), 1],
  ])('%s', (_case, attempts, expected) => {
    expect(targetDifficulty(attempts)).toBe(expected);
  });

  it('starts from the average difficulty actually served', () => {
    expect(targetDifficulty([...answered(2, [1, 1]), ...answered(4, [1, 1])])).toBe(3.5);
  });

  it('uses partial credit as accuracy', () => {
    expect(targetDifficulty(answered(3, [0.5, 0.5]))).toBe(2.5);
  });
});

describe('slotTargets', () => {
  it.each([
    [3, 5, [2, 2.5, 3, 3.5, 4]],
    [2.5, 3, [1.5, 2.5, 3.5]],
    [1, 3, [1, 1, 2]],
    [5, 3, [4, 5, 5]],
    [2.5, 1, [2.5]],
    [3, 0, []],
  ])('target %p × %p slots → %j', (target, count, expected) => {
    expect(slotTargets(target, count)).toEqual(expected);
  });
});

describe('rankByFreshness', () => {
  const pool = ['a', 'b', 'c', 'd'].map(id => ({
    id,
    topicId: 't',
    subcategory: 's',
    difficulty: 3,
  }));
  const staleness = (attempts: Parameters<typeof rankByFreshness>[1]) =>
    Object.fromEntries(rankByFreshness(pool, attempts).map(item => [item.id, item.staleness]));

  it('ranks unseen problems 0 and seen ones from the least recently seen', () => {
    expect(staleness([attempt('b', { daysAgo: 2 }), attempt('c', { daysAgo: 9 })])).toEqual({
      a: 0,
      b: 2,
      c: 1,
      d: 0,
    });
  });

  it('uses the latest attempt of a problem', () => {
    const attempts = [
      attempt('b', { daysAgo: 20 }),
      attempt('b', { daysAgo: 1 }),
      attempt('c', { daysAgo: 5 }),
    ];
    expect(staleness(attempts)).toMatchObject({ b: 2, c: 1 });
  });

  it('on the same day, brings back a wrong answer before a right one', () => {
    const attempts = [
      attempt('a', { daysAgo: 3, score: 1 }),
      attempt('d', { daysAgo: 3, score: 0 }),
    ];
    expect(staleness(attempts)).toMatchObject({ d: 1, a: 2 });
  });
});
