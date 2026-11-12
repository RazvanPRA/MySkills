// Public API of the notifications feature: the daily reminder (brief §2, §9.8). Components are
// lazy so the index loads without react-native.
import { lazy } from 'react';

export {
  DEFAULT_REMINDER_TIME,
  type NotificationPermission,
  type ReminderScheduler,
  type ReminderTexts,
  type TimeOfDay,
} from './model/reminder';
export { formatTime, parseTime, shiftTime } from './services/reminderTime.service';
export { setReminder, syncReminder, type NotificationsDependencies } from './state/thunks';

export const ReminderControl = lazy(() => import('./components/ReminderControl/ReminderControl'));
export const ReminderCard = lazy(() => import('./components/ReminderCard/ReminderCard'));
export const ReminderSync = lazy(() => import('./components/ReminderSync'));
