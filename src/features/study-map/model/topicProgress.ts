import { z } from 'zod';
import { contentIdSchema, isoDateTimeSchema } from '@/shared/domain';

export const topicStatuses = ['not_started', 'in_progress', 'studied'] as const;
export const topicStatusSchema = z.enum(topicStatuses);
export type TopicStatus = z.infer<typeof topicStatusSchema>;

/** The user's progress on one topic. A topic with no record is "not_started". */
export const topicProgressSchema = z.object({
  topicId: contentIdSchema,
  status: topicStatusSchema,
  studiedAt: isoDateTimeSchema.optional(),
  notes: z.string().optional(),
  /** Last change; used for last-write-wins sync with the backend later. */
  updatedAt: isoDateTimeSchema,
});
export type TopicProgress = z.infer<typeof topicProgressSchema>;

/** Topics marked as covered feed the knowledge test (brief §7.1). */
export const isCovered = (progress: Pick<TopicProgress, 'status'>): boolean =>
  progress.status === 'in_progress' || progress.status === 'studied';
