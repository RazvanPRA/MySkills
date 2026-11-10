import { z } from 'zod';
import { choiceOptionsSchema, optionIndexSchema } from '@/shared/domain';

const uniqueIndices = (indices: readonly number[]) => new Set(indices).size === indices.length;

export const multipleChoicePayloadSchema = z
  .object({
    options: choiceOptionsSchema,
    /** 0-based indices of every correct option; the player asks for exactly this many. */
    correctIndices: z.array(optionIndexSchema).min(1),
  })
  .refine(payload => uniqueIndices(payload.correctIndices), {
    message: 'correctIndices must not repeat',
    path: ['correctIndices'],
  })
  .refine(payload => payload.correctIndices.every(index => index < payload.options.length), {
    message: 'correctIndices must point to existing options',
    path: ['correctIndices'],
  })
  .refine(payload => payload.correctIndices.length < payload.options.length, {
    message: 'at least one option must be wrong',
    path: ['correctIndices'],
  });
export type MultipleChoicePayload = z.infer<typeof multipleChoicePayloadSchema>;

/** At least one pick; the order of `indices` does not matter. */
export const multipleChoiceAnswerSchema = z.object({
  indices: z.array(optionIndexSchema).min(1).refine(uniqueIndices, 'indices must not repeat'),
});
export type MultipleChoiceAnswer = z.infer<typeof multipleChoiceAnswerSchema>;
