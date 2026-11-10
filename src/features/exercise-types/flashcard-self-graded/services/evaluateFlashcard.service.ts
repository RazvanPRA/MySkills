import type { EvaluationResult, ReviewRating } from '@/shared/domain';
import type { FlashcardAnswer, FlashcardPayload } from '../model/schemas';

const RATING_STEPS = 3;

/** Pure: the self-rating is the grade. Good or Easy count as correct; score is linear 0..1. */
export function evaluateFlashcard(
  _payload: FlashcardPayload,
  answer: FlashcardAnswer,
): EvaluationResult {
  return { correct: answer.rating >= 3, score: (answer.rating - 1) / RATING_STEPS };
}

/** The self-rating feeds FSRS unchanged (it is recovered exactly from the score). */
export function flashcardFsrsRating(result: EvaluationResult): ReviewRating {
  return (Math.round(result.score * RATING_STEPS) + 1) as ReviewRating;
}
