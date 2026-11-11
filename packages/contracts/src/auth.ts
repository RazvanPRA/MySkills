import { z } from 'zod';

/** Email is case-insensitive: normalized once, here, for both app and server. */
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));

/** 12+ characters; a length rule beats composition rules (NIST SP 800-63B). */
export const passwordSchema = z.string().min(12).max(128);

export const credentialsSchema = z.object({ email: emailSchema, password: passwordSchema });
export type Credentials = z.infer<typeof credentialsSchema>;

export const refreshRequestSchema = z.object({ refreshToken: z.string().min(32).max(256) });
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;

/** What register, login and refresh return. */
export const tokenPairSchema = z.object({
  accessToken: z.string(),
  /** Seconds until the access token expires. */
  expiresIn: z.number().int().positive(),
  /** Opaque, single use: every refresh returns a new one. */
  refreshToken: z.string(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.iso.datetime(),
});
export type Me = z.infer<typeof meSchema>;
