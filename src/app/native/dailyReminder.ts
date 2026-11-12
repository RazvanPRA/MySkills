import { PermissionsAndroid, Platform } from 'react-native';
import type { NotificationPermission, ReminderScheduler } from '@/features/notifications';
import NativeDailyReminder from '@/native/specs/NativeDailyReminder';

/** The daily reminder through the app's Android module (src/native/specs/NativeDailyReminder.ts). */
export function createAndroidReminders(): ReminderScheduler {
  const native = NativeDailyReminder;
  if (!native) {
    const unavailable = () =>
      Promise.reject(new Error('The DailyReminder native module is missing'));
    return { schedule: unavailable, cancel: unavailable };
  }
  return {
    schedule: ({ hour, minute }, { title, body, channelName }) =>
      native.schedule(hour, minute, title, body, channelName),
    cancel: () => native.cancel(),
  };
}

/** Android 13 (API 33) added a runtime permission for notifications. */
const NEEDS_RUNTIME_PERMISSION = 33;

export const androidNotificationPermission: NotificationPermission = {
  request: async () => {
    if (Platform.OS !== 'android' || Number(Platform.Version) < NEEDS_RUNTIME_PERMISSION) {
      return 'granted';
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  },
};
