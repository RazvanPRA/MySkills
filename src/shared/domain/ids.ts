import { z } from 'zod';

/**
 * Content ids: lowercase segments separated by "." or "-".
 * Examples: "react", "react.hooks.use-effect", "react.hooks.use-effect.q01".
 */
const CONTENT_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

export const contentIdSchema = z
  .string()
  .regex(CONTENT_ID, 'Use lowercase letters, digits, "." and "-" (e.g. "react.hooks.use-effect")');

/** Calendar day in the device's local time zone. */
export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const isoDateTimeSchema = z.iso.datetime({ offset: true });
