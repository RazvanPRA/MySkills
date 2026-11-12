import { useEffect } from 'react';
import { useSettings } from '@/features/settings';
import { useReminderTexts } from '../hooks/useReminderTexts';
import { useNotificationsDispatch } from '../state/hooks';
import { syncReminder } from '../state/thunks';

/**
 * Keeps the scheduled reminder in step with the app: re-armed on every start and with texts
 * in the current language. Renders nothing.
 */
export default function ReminderSync() {
  const dispatch = useNotificationsDispatch();
  const texts = useReminderTexts();
  const { settings } = useSettings();
  const time = settings.notificationTime;
  useEffect(() => {
    if (time !== null) {
      dispatch(syncReminder(texts));
    }
  }, [dispatch, texts, time]);
  return null;
}
