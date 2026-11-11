import { z } from 'zod';

/**
 * The server has one user: whoever holds its API key. Every request except /health sends it
 * in this header. Both ends read the key from a gitignored .env file.
 */
export const apiKeyHeader = 'x-api-key';

/** `GET /ping`: lets the app check that its server URL and API key work. */
export const pingResponseSchema = z.object({ status: z.literal('ok') });
export type PingResponse = z.infer<typeof pingResponseSchema>;
