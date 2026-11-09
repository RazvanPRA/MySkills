import { z } from 'zod';

/** Competency level, in ascending order. */
export const levels = ['junior', 'mid', 'senior'] as const;

export const levelSchema = z.enum(levels);
export type Level = z.infer<typeof levelSchema>;
