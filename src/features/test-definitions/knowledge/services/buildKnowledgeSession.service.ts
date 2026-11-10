import { attemptsSince, type SessionPlan, type TestBuildContext } from '@/features/daily-tests';
import { endOfLocalDayIso } from '@/shared/utils/localDate';
import { createSeededRandom, shuffle, weightedOrder } from '@/shared/utils/seededRandom';
import {
  ACCURACY_WINDOW_DAYS,
  knowledgeQuotas,
  MAX_PER_CATEGORY,
  STRETCH_LEVEL,
  STRETCH_MIN_DIFFICULTY,
} from '../model/constants';
import { categoryAccuracy, newExerciseWeight } from './categoryWeakness';
import { buildKnowledgePool, dueExercises, type PoolExercise } from './knowledgePool';
import { pickWithVariety } from './pickWithVariety';

const isStretch = (item: PoolExercise) =>
  item.level === STRETCH_LEVEL && item.difficulty >= STRETCH_MIN_DIFFICULTY;

/**
 * Brief §7.1, pure and deterministic for a given context:
 * due reviews (most overdue first) → new exercises (weak categories more likely) → one
 * stretch exercise, with variety rules. Unused slots are filled from the rest of the pool;
 * a pool that is still too small gives a shorter test and a `shortfall`.
 */
export function buildKnowledgeSession(context: TestBuildContext): SessionPlan {
  const target = context.settings.knowledgeTestLength;
  const random = createSeededRandom(context.seed);
  const pool = buildKnowledgePool(context);
  const cards = new Map(context.reviewCards.map(card => [card.exerciseId, card]));
  const lastTwoWeeks = attemptsSince(context.recentAttempts, {
    date: context.date,
    days: ACCURACY_WINDOW_DAYS,
  });
  const accuracy = categoryAccuracy(lastTwoWeeks, context.catalog);

  const due = dueExercises(pool, cards, endOfLocalDayIso(context.date));
  const fresh = weightedOrder(
    pool.filter(item => !cards.has(item.id)),
    item => newExerciseWeight(accuracy.get(item.categoryId)),
    random,
  );
  const stretch = [...fresh, ...shuffle(pool, random)].filter(isStretch);
  const quotas = knowledgeQuotas(target);

  const [duePicks = [], newPicks = [], stretchPicks = [], fillPicks = []] = pickWithVariety(
    [
      { candidates: due, max: quotas.due },
      { candidates: fresh, max: quotas.fresh },
      { candidates: stretch, max: quotas.stretch },
      { candidates: [...fresh, ...due], max: target },
    ],
    { target, maxPerCategory: MAX_PER_CATEGORY },
  );
  // The stretch exercise comes last: the hardest question closes the test.
  const exerciseIds = [...duePicks, ...newPicks, ...fillPicks, ...stretchPicks].map(
    item => item.id,
  );
  return exerciseIds.length < target
    ? { exerciseIds, shortfall: { target, available: exerciseIds.length, remedy: 'mark_topics' } }
    : { exerciseIds };
}
