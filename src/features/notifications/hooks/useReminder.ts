import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useSettings } from '@/features/settings';
import { DEFAULT_REMINDER_TIME, REMINDER_STEP_MINUTES } from '../model/reminder';
import { shiftTime } from '../services/reminderTime.service';
import { useNotificationsDispatch } from '../state/hooks';
import { setReminder } from '../state/thunks';
import { useReminderTexts } from './useReminderTexts';

/** The daily reminder setting: on/off, the time in 15-minute steps, and a blocked state. */
export function useReminder() {
  const dispatch = useNotificationsDispatch();
  const texts = useReminderTexts();
  const { settings } = useSettings();
  const [denied, setDenied] = useState(false);
  const stored = settings.notificationTime;
  const time = stored ?? DEFAULT_REMINDER_TIME;

  const apply = useCallback(
    async (next: string | null) => {
      const result = await dispatch(setReminder({ time: next, texts }))
        .unwrap()
        .catch(() => null);
      setDenied(result === 'denied');
    },
    [dispatch, texts],
  );
  const toggle = useCallback((id: string) => apply(id === 'on' ? time : null), [apply, time]);
  const earlier = useCallback(() => apply(shiftTime(time, -REMINDER_STEP_MINUTES)), [apply, time]);
  const later = useCallback(() => apply(shiftTime(time, REMINDER_STEP_MINUTES)), [apply, time]);
  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);
  return { enabled: stored !== null, time, toggle, earlier, later, denied, openSettings };
}
