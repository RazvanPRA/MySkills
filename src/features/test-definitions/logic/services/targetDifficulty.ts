import {
  DEFAULT_TARGET_DIFFICULTY,
  DIFFICULTY_BOUNDS,
  DIFFICULTY_STEP,
  TARGET_ACCURACY,
} from '../model/constants';

/** One answered logic problem of the accuracy window. */
export type ScoredAttempt = { difficulty: number; score: number };

const mean = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const clamp = (value: number) =>
  Math.min(DIFFICULTY_BOUNDS.max, Math.max(DIFFICULTY_BOUNDS.min, value));

/**
 * Brief §7.2.2, pure: today's target average difficulty. Starts from the average difficulty
 * actually served in the window and moves it 0.5 toward 70–80% accuracy. Deriving it from
 * history (instead of storing yesterday's target) needs no state and self-corrects when the
 * pool lacks problems at the target.
 */
export function targetDifficulty(attempts: readonly ScoredAttempt[]): number {
  if (attempts.length === 0) {
    return DEFAULT_TARGET_DIFFICULTY;
  }
  const accuracy = mean(attempts.map(attempt => attempt.score));
  const served = mean(attempts.map(attempt => attempt.difficulty));
  if (accuracy > TARGET_ACCURACY.max) {
    return clamp(served + DIFFICULTY_STEP);
  }
  if (accuracy < TARGET_ACCURACY.min) {
    return clamp(served - DIFFICULTY_STEP);
  }
  return clamp(served);
}
