import { z } from 'zod';
import { localizedTextSchema, reviewRatingSchema } from '@/shared/domain';

export const flashcardPayloadSchema = z.object({
  /** The model answer a senior would give (Markdown). */
  answer: localizedTextSchema,
  /** What a good answer must mention; shown as a checklist after reveal. */
  keyPoints: z.array(localizedTextSchema).max(8).default([]),
});
export type FlashcardPayload = z.infer<typeof flashcardPayloadSchema>;

/** The user's own rating: 1 Didn't know · 2 Hard · 3 Good · 4 Easy. */
export const flashcardAnswerSchema = z.object({ rating: reviewRatingSchema });
export type FlashcardAnswer = z.infer<typeof flashcardAnswerSchema>;
