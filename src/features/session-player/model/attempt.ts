import { z } from 'zod';
import {
  contentIdSchema,
  evaluationResultSchema,
  isoDateTimeSchema,
  reviewRatingSchema,
} from '@/shared/domain';

/** One answered exercise inside a session. */
export const attemptSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  exerciseId: contentIdSchema,
  /** Validated by the exercise type's answerSchema before it is stored. */
  answer: z.unknown(),
  result: evaluationResultSchema,
  durationMs: z.number().int().nonnegative(),
  /** Self-rating: 1 Didn't know · 2 Hard · 3 Good · 4 Easy. */
  confidence: reviewRatingSchema.optional(),
  /** When the answer was checked. Drives the 14-day window, mastery decay and repeat rules. */
  answeredAt: isoDateTimeSchema,
});
export type Attempt = z.infer<typeof attemptSchema>;
