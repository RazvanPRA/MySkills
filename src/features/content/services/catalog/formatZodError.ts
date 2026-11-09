import type { z } from 'zod';

const MAX_REPORTED = 3;

/** "title.ro: Too small; level: Invalid option" (first few problems only). */
export function formatZodError(error: z.ZodError): string {
  const parts = error.issues
    .slice(0, MAX_REPORTED)
    .map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`);
  const more = error.issues.length - MAX_REPORTED;
  return more > 0 ? `${parts.join('; ')} (+${more} more)` : parts.join('; ');
}
