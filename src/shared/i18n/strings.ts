import { backupEn, backupRo } from './sections/backup';
import { coreEn, coreRo } from './sections/core';
import { notificationsEn, notificationsRo } from './sections/notifications';
import { onboardingEn, onboardingRo } from './sections/onboarding';
import { progressEn, progressRo } from './sections/progress';
import { sessionEn, sessionRo } from './sections/session';
import { settingsEn, settingsRo } from './sections/settings';
import { studyEn, studyRo } from './sections/study';
import { todayEn, todayRo } from './sections/today';

/**
 * Every user-visible UI string, in Romanian (default) and English, composed from sections
 * that keep both languages side by side. `en` is typed as `Strings`, so a key missing in
 * either language fails compilation. Romanian uses comma-below ș/ț; a test enforces it.
 */
const ro = {
  ...coreRo,
  ...studyRo,
  ...sessionRo,
  today: todayRo,
  progress: progressRo,
  settings: settingsRo,
  backup: backupRo,
  notifications: notificationsRo,
  onboarding: onboardingRo,
};

export type Strings = typeof ro;

const en: Strings = {
  ...coreEn,
  ...studyEn,
  ...sessionEn,
  today: todayEn,
  progress: progressEn,
  settings: settingsEn,
  backup: backupEn,
  notifications: notificationsEn,
  onboarding: onboardingEn,
};

export const languages = ['ro', 'en'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = 'ro';

export const strings: Record<Language, Strings> = { ro, en };
