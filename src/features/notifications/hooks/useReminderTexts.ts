import { useMemo } from 'react';
import { useStrings } from '@/shared/i18n';
import type { ReminderTexts } from '../model/reminder';

/** The notification's texts in the current language. */
export function useReminderTexts(): ReminderTexts {
  const { notifications } = useStrings();
  return useMemo(
    () => ({
      title: notifications.notification.title,
      body: notifications.notification.body,
      channelName: notifications.notification.channel,
    }),
    [notifications],
  );
}
