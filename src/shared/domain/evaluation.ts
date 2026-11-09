import { z } from 'zod';
import { localizedTextSchema } from './localizedText';

/** Outcome of evaluating one answer. `score` allows partial credit (0..1). */
export const evaluationResultSchema = z.object({
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  feedback: localizedTextSchema.optional(),
});
export type EvaluationResult = z.infer<typeof evaluationResultSchema>;

/**
 * Self-rating after an exercise, on the FSRS scale:
 * 1 Didn't know (Again) · 2 Hard · 3 Good · 4 Easy.
 */
export const reviewRatingSchema = z.literal([1, 2, 3, 4]);
export type ReviewRating = z.infer<typeof reviewRatingSchema>;
