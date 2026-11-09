import { z } from 'zod';
import { languages } from '@/shared/i18n';

export const knowledgeTestLengths = [5, 10, 15] as const;
export const logicTestLengths = [3, 5, 8] as const;

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * User preferences, stored as one JSON document. Every field has a default, so
 * `userSettingsSchema.parse({})` is a valid first-run state and new fields need no migration.
 */
export const userSettingsSchema = z.object({
  language: z.enum(languages).default('ro'),
  knowledgeTestLength: z.literal(knowledgeTestLengths).default(10),
  logicTestLength: z.literal(logicTestLengths).default(5),
  /** Daily reminder time "HH:MM" in local time, or null when reminders are off. */
  notificationTime: z.string().regex(HH_MM, 'Expected HH:MM').nullable().default(null),
  timerEnabled: z.boolean().default(false),
  onboardingDone: z.boolean().default(false),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;

export const defaultUserSettings: UserSettings = userSettingsSchema.parse({});
