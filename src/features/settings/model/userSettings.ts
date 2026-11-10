import { z } from 'zod';
import { levelSchema, levels } from '@/shared/domain';
import { languages } from '@/shared/i18n';

export const knowledgeTestLengths = [5, 10, 15] as const;
export const logicTestLengths = [3, 5, 8] as const;

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Onboarding self-assessment of one category: the level the user is at home with, or none. */
export const selfAssessmentSchema = z.enum(['none', ...levels]);
export type SelfAssessment = z.infer<typeof selfAssessmentSchema>;

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
  /** Study map filters, kept across restarts (design system §6.3). */
  studyLevels: z.array(levelSchema).default([...levels]),
  studyCategoryId: z.string().nullable().default(null),
  /** Self-assessment by category id, from onboarding; Progress shows it next to the estimate. */
  selfAssessment: z.record(z.string(), selfAssessmentSchema).default({}),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;

export const defaultUserSettings: UserSettings = userSettingsSchema.parse({});
