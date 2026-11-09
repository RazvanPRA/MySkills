import { z } from 'zod';
import { contentIdSchema, isoDateTimeSchema } from '@/shared/domain';

export const reviewStates = ['new', 'learning', 'review', 'relearning'] as const;
export const reviewStateSchema = z.enum(reviewStates);
export type ReviewState = z.infer<typeof reviewStateSchema>;

/**
 * FSRS scheduling state for one exercise. Field names follow ts-fsrs's Card, so mapping
 * is lossless. `scheduledDays` and `learningSteps` are needed to resume a card exactly.
 */
export const reviewCardSchema = z.object({
  exerciseId: contentIdSchema,
  due: isoDateTimeSchema,
  stability: z.number().nonnegative(),
  difficulty: z.number().nonnegative(),
  scheduledDays: z.number().int().nonnegative(),
  learningSteps: z.number().int().nonnegative(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  state: reviewStateSchema,
  lastReview: isoDateTimeSchema.optional(),
});
export type ReviewCard = z.infer<typeof reviewCardSchema>;
