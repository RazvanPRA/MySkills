import { z } from 'zod';
import { contentIdSchema, isoDateTimeSchema, localDateSchema } from '@/shared/domain';

export const sessionStatuses = ['pending', 'in_progress', 'completed'] as const;
export const sessionStatusSchema = z.enum(sessionStatuses);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

/** Narrows an on-demand session ("Practice this topic only"). Daily tests have none. */
export const testScopeSchema = z.object({
  topicIds: z.array(contentIdSchema).optional(),
  categoryIds: z.array(z.string().min(1)).optional(),
});
export type TestScope = z.infer<typeof testScopeSchema>;

/**
 * A generated test. Daily sessions (no scope) are unique per (date, testKind), so reopening
 * the app the same day returns the same test with its progress. On-demand sessions have a
 * scope and may repeat.
 */
export const dailySessionSchema = z.object({
  id: z.string().min(1),
  /** YYYY-MM-DD in the device's local time zone. */
  date: localDateSchema,
  /** Key in the TestRegistry: "logic", "knowledge", ... */
  testKind: z.string().min(1),
  exerciseIds: z.array(contentIdSchema),
  status: sessionStatusSchema,
  startedAt: isoDateTimeSchema.optional(),
  completedAt: isoDateTimeSchema.optional(),
  /** 0..1, set when completed. */
  score: z.number().min(0).max(1).optional(),
  scope: testScopeSchema.optional(),
});
export type DailySession = z.infer<typeof dailySessionSchema>;
