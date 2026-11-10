import type { ContentCatalog } from '@/features/content';
import type { Attempt } from '@/features/session-player';
import { MIN_NEW_WEIGHT, NEUTRAL_ACCURACY } from '../model/constants';

/**
 * Mean attempt score per category over the given attempts (the last 14 days).
 * Stands in for category mastery until Phase 4 computes the real one.
 */
export function categoryAccuracy(
  attempts: readonly Attempt[],
  catalog: ContentCatalog,
): Map<string, number> {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const attempt of attempts) {
    const topicId = catalog.exercisesById.get(attempt.exerciseId)?.topicId;
    const categoryId = topicId ? catalog.topicsById.get(topicId)?.categoryId : undefined;
    if (categoryId) {
      const total = totals.get(categoryId) ?? { sum: 0, count: 0 };
      totals.set(categoryId, { sum: total.sum + attempt.result.score, count: total.count + 1 });
    }
  }
  return new Map([...totals].map(([id, { sum, count }]) => [id, sum / count]));
}

/** Brief §7.1.3: weak categories weigh more; a category never drops to 0. */
export const newExerciseWeight = (accuracy: number | undefined): number =>
  1 - (accuracy ?? NEUTRAL_ACCURACY) + MIN_NEW_WEIGHT;
