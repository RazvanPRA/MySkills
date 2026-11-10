import { attemptsSince, type SessionPlan, type TestBuildContext } from '@/features/daily-tests';
import { createSeededRandom, shuffle } from '@/shared/utils/seededRandom';
import { ACCURACY_WINDOW_DAYS, NO_REPEAT_DAYS } from '../model/constants';
import { rankByFreshness } from './freshness';
import { buildLogicPool } from './logicPool';
import { pickLogicProblems } from './pickLogicProblems';
import { targetDifficulty } from './targetDifficulty';

/**
 * Brief §7.2, pure and deterministic for a given context: the target difficulty adapts to the
 * last 7 days, problems seen in the last 30 days come only after fresh ones, and the day
 * covers at least 3 subcategories. Problems are ordered from easiest to hardest.
 */
export function buildLogicSession(context: TestBuildContext): SessionPlan {
  const count = context.settings.logicTestLength;
  const pool = buildLogicPool(context.catalog);
  const byId = new Map(pool.map(candidate => [candidate.id, candidate]));
  const logicAttempts = context.recentAttempts.filter(attempt => byId.has(attempt.exerciseId));
  const week = attemptsSince(logicAttempts, { date: context.date, days: ACCURACY_WINDOW_DAYS });
  const target = targetDifficulty(
    week.map(attempt => ({
      difficulty: byId.get(attempt.exerciseId)?.difficulty ?? 0,
      score: attempt.result.score,
    })),
  );
  const window = attemptsSince(logicAttempts, { date: context.date, days: NO_REPEAT_DAYS });
  const candidates = shuffle(rankByFreshness(pool, window), createSeededRandom(context.seed));
  const picks = pickLogicProblems({ candidates, count, target });
  const exerciseIds = [...picks]
    .sort((a, b) => a.difficulty - b.difficulty)
    .map(candidate => candidate.id);
  return exerciseIds.length < count
    ? { exerciseIds, shortfall: { target: count, available: exerciseIds.length } }
    : { exerciseIds };
}
