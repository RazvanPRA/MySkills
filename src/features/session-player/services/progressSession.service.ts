import type { DailySession } from '@/features/daily-tests';
import type { Attempt } from '../model/attempt';

type ProgressInput = {
  session: DailySession;
  /** Every attempt of the session, including the one just saved. */
  attempts: readonly Attempt[];
  /** The session's exercises that still exist in the content. */
  exerciseIds: readonly string[];
  now: Date;
};

/** The first exercise without an attempt, or `exerciseIds.length` when all are answered. */
export function resumeIndex(exerciseIds: readonly string[], attempts: readonly Attempt[]): number {
  const answered = new Set(attempts.map(attempt => attempt.exerciseId));
  const index = exerciseIds.findIndex(id => !answered.has(id));
  return index === -1 ? exerciseIds.length : index;
}

/** Mean score over the session's exercises; an unanswered exercise counts as 0. */
export function sessionScore(exerciseIds: readonly string[], attempts: readonly Attempt[]): number {
  if (exerciseIds.length === 0) {
    return 0;
  }
  const scores = new Map(attempts.map(attempt => [attempt.exerciseId, attempt.result.score]));
  const total = exerciseIds.reduce((sum, id) => sum + (scores.get(id) ?? 0), 0);
  return total / exerciseIds.length;
}

/**
 * Pure: the session after an answer. The first answer starts it; the last one completes it
 * with its score. Timestamps come from the injected `now`.
 */
export function progressSession({
  session,
  attempts,
  exerciseIds,
  now,
}: ProgressInput): DailySession {
  const started = { ...session, startedAt: session.startedAt ?? now.toISOString() };
  if (resumeIndex(exerciseIds, attempts) < exerciseIds.length) {
    return { ...started, status: 'in_progress' };
  }
  return {
    ...started,
    status: 'completed',
    completedAt: session.completedAt ?? now.toISOString(),
    score: sessionScore(exerciseIds, attempts),
  };
}
