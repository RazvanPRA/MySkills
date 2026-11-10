import { z } from 'zod';
import { choiceOptionsSchema, optionIndexSchema } from '@/shared/domain';

export const singleChoicePayloadSchema = z
  .object({
    options: choiceOptionsSchema,
    /** 0-based index of the only correct option. */
    correctIndex: optionIndexSchema,
  })
  .refine(payload => payload.correctIndex < payload.options.length, {
    message: 'correctIndex must point to an existing option',
    path: ['correctIndex'],
  });
export type SingleChoicePayload = z.infer<typeof singleChoicePayloadSchema>;

export const singleChoiceAnswerSchema = z.object({ index: optionIndexSchema });
export type SingleChoiceAnswer = z.infer<typeof singleChoiceAnswerSchema>;
