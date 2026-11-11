import { z } from 'zod';

/** Every error response of the API has this shape. */
export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  /** Stable, machine-readable: the app maps it to a translated message. */
  code: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const apiErrorCodes = [
  'validation_failed',
  'unauthorized',
  'rate_limited',
  'not_found',
  'internal',
] as const;
export type ApiErrorCode = (typeof apiErrorCodes)[number];
