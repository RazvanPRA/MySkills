import type { Exercise } from '@/features/content';
import type { SessionPlan, TestBuildContext } from '@/features/daily-tests';
import { createSeededRandom, shuffle } from '@/shared/utils/seededRandom';
import { PRACTICE_LENGTH } from '../model/constants';

/** Last time each exercise was answered (ISO), from the recent attempts. */
function lastAnswered(context: TestBuildContext): Map<string, string> {
  const last = new Map<string, string>();
  for (const attempt of context.recentAttempts) {
    const previous = last.get(attempt.exerciseId);
    if (previous === undefined || attempt.answeredAt > previous) {
      last.set(attempt.exerciseId, attempt.answeredAt);
    }
  }
  return last;
}

/**
 * Pure: the exercises of the scoped topics, in any category and whatever their status.
 * Not recently answered first (seeded order), then the least recently answered; at most
 * PRACTICE_LENGTH, served from easiest to hardest. Empty without a topic scope.
 */
export function buildPracticeSession(context: TestBuildContext): SessionPlan {
  const topicIds = context.scope?.topicIds ?? [];
  const pool: Exercise[] = topicIds.flatMap(id => context.catalog.exercisesByTopic.get(id) ?? []);
  const last = lastAnswered(context);
  const freshness = (exercise: Exercise) => last.get(exercise.id) ?? '';
  const picked = shuffle(pool, createSeededRandom(context.seed))
    // Stable sort: unseen ('' sorts first) keep their shuffled order.
    .sort((a, b) => freshness(a).localeCompare(freshness(b)))
    .slice(0, PRACTICE_LENGTH);
  return { exerciseIds: picked.sort((a, b) => a.difficulty - b.difficulty).map(e => e.id) };
}
