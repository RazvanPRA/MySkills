import type { EvaluationResult, ReviewRating } from '@/shared/domain';

/** Below this score a partially correct answer counts as forgotten. */
export const PARTIAL_CREDIT_THRESHOLD = 0.5;

/**
 * Rating for exercise types without their own `toFsrsRating`:
 * wrong → Again, partially correct (score ≥ 0.5) → Hard, correct → the self-rating or Good.
 */
export function defaultFsrsRating(
  result: EvaluationResult,
  confidence?: ReviewRating,
): ReviewRating {
  if (result.correct) {
    return confidence ?? 3;
  }
  return result.score >= PARTIAL_CREDIT_THRESHOLD ? 2 : 1;
}
