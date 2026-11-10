import { z } from 'zod';
import { localizedTextSchema } from './localizedText';

export const MIN_CHOICE_OPTIONS = 2;
export const MAX_CHOICE_OPTIONS = 6;

/** Answer options of choice exercises (single and multiple choice). Markdown, lettered A–F. */
export const choiceOptionsSchema = z
  .array(localizedTextSchema)
  .min(MIN_CHOICE_OPTIONS)
  .max(MAX_CHOICE_OPTIONS);

/** A 0-based option index. */
export const optionIndexSchema = z.number().int().nonnegative();
