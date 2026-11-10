import { createAsyncThunk } from '@reduxjs/toolkit';
import { type SettingsDependencies, type SettingsState, updateSettings } from '@/features/settings';
import type { NotificationPermission, ReminderScheduler, ReminderTexts } from '../model/reminder';
import { parseTime } from '../services/reminderTime.service';

/** What this feature needs from the dependency container. */
export type NotificationsDependencies = SettingsDependencies & {
  reminders: ReminderScheduler;
  notificationPermission: NotificationPermission;
};

type ThunkConfig = { extra: NotificationsDependencies; state: { settings: SettingsState } };

export type ReminderChange = { time: string | null; texts: ReminderTexts };

/**
 * Turns the daily reminder on at `time` (asking for permission first), moves it, or turns it
 * off (`time: null`). The time is saved only once the reminder is really scheduled.
 */
export const setReminder = createAsyncThunk<'on' | 'off' | 'denied', ReminderChange, ThunkConfig>(
  'notifications/set',
  async ({ time, texts }, { extra, dispatch }) => {
    const parsed = time === null ? null : parseTime(time);
    if (parsed === null) {
      await extra.reminders.cancel();
      await dispatch(updateSettings({ notificationTime: null }));
      return 'off';
    }
    if ((await extra.notificationPermission.request()) === 'denied') {
      return 'denied';
    }
    await extra.reminders.schedule(parsed, texts);
    await dispatch(updateSettings({ notificationTime: time }));
    return 'on';
  },
);

/**
 * Re-arms the stored reminder with texts in the current language (on start and after a
 * language change). Never asks for permission.
 */
export const syncReminder = createAsyncThunk<void, ReminderTexts, ThunkConfig>(
  'notifications/sync',
  async (texts, { extra, getState }) => {
    const parsed = parseTime(getState().settings.values.notificationTime ?? '');
    if (parsed) {
      await extra.reminders.schedule(parsed, texts);
    }
  },
);
