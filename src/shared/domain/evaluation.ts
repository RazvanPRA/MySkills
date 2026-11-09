import { z } from 'zod';
import { localizedTextSchema } from './localizedText';

/** Partial credit in countable units, e.g. 2 of 3 correct options ("Parțial corect (2/3)"). */
export const creditSchema = z.object({
  earned: z.number().int().nonnegative(),
  total: z.number().int().positive(),
});
export type Credit = z.infer<typeof creditSchema>;

/** Outcome of evaluating one answer. `score` allows partial credit (0..1). */
export const evaluationResultSchema = z.object({
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  feedback: localizedTextSchema.optional(),
  /** Set by types that grade in units, so the player can show "k/n" without knowing the type. */
  credit: creditSchema.optional(),
});
export type EvaluationResult = z.infer<typeof evaluationResultSchema>;

/**
 * Self-rating after an exercise, on the FSRS scale:
 * 1 Didn't know (Again) · 2 Hard · 3 Good · 4 Easy.
 */
export const reviewRatingSchema = z.literal([1, 2, 3, 4]);
export type ReviewRating = z.infer<typeof reviewRatingSchema>;
export const reviewRatings = [1, 2, 3, 4] as const satisfies readonly ReviewRating[];
