/** A local time of day, 24h. */
export type TimeOfDay = { hour: number; minute: number };

/** The texts of the notification, already translated (the scheduler runs without JS). */
export type ReminderTexts = { title: string; body: string; channelName: string };

/** Schedules the daily local notification (Android: src/native/specs/NativeDailyReminder.ts). */
export type ReminderScheduler = {
  schedule: (time: TimeOfDay, texts: ReminderTexts) => Promise<void>;
  cancel: () => Promise<void>;
};

/** Android 13+ asks before an app may post notifications. */
export type NotificationPermission = {
  request: () => Promise<'granted' | 'denied'>;
};

/** Default reminder time when it is first turned on. */
export const DEFAULT_REMINDER_TIME = '20:00';

/** The time moves in 15-minute steps. */
export const REMINDER_STEP_MINUTES = 15;
