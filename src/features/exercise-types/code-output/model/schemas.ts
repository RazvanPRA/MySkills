import { z } from 'zod';
import { choiceOptionsSchema, optionIndexSchema } from '@/shared/domain';

/** Pick the output among options (the code is in the prompt, as a fenced block). */
const choiceModeSchema = z.object({
  mode: z.literal('choice'),
  options: choiceOptionsSchema,
  correctIndex: optionIndexSchema,
});

/** Type the output; compared after normalizing whitespace and quotes. */
const inputModeSchema = z.object({
  mode: z.literal('input'),
  /** The exact output, shown after reveal. */
  expected: z.string().trim().min(1),
  /** Other spellings accepted as correct (e.g. `[1, 2]` and `[ 1, 2 ]` differ in more than spaces). */
  accepted: z.array(z.string().trim().min(1)).default([]),
});

export const codeOutputPayloadSchema = z
  .discriminatedUnion('mode', [choiceModeSchema, inputModeSchema])
  .refine(payload => payload.mode !== 'choice' || payload.correctIndex < payload.options.length, {
    message: 'correctIndex must point to an existing option',
    path: ['correctIndex'],
  });
export type CodeOutputPayload = z.infer<typeof codeOutputPayloadSchema>;

/** A picked option (choice mode) or typed text (input mode); blank text is not an answer. */
export const codeOutputAnswerSchema = z.union([
  z.object({ index: optionIndexSchema }),
  z.object({ text: z.string().refine(text => text.trim().length > 0, 'Type the output') }),
]);
export type CodeOutputAnswer = z.infer<typeof codeOutputAnswerSchema>;
