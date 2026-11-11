import { z } from 'zod';

/**
 * Server configuration, validated once at startup: a missing or weak secret stops the server
 * with a clear message instead of failing on the first request. Secrets live in .env
 * (gitignored); .env.example documents every variable.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  /** The only credential: the app sends it on every request (single-user server). */
  API_KEY: z.string().min(32, 'API_KEY needs at least 32 characters'),
});
export type Env = z.infer<typeof envSchema>;

/** Dependency-injection token for the validated configuration. */
export const ENV = Symbol('ENV');

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid server configuration:\n- ${problems.join('\n- ')}`);
  }
  return parsed.data;
}
