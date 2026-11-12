import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * The daily study reminder (instead of the archived Notifee): an inexact daily alarm that posts
 * a notification opening seniorprep://today, rescheduled after a reboot.
 */
export interface Spec extends TurboModule {
  /**
   * Replaces any previous reminder. Texts are already translated; `channelName` is what
   * Android shows in the app's notification settings.
   */
  schedule(
    hour: number,
    minute: number,
    title: string,
    body: string,
    channelName: string,
  ): Promise<void>;
  cancel(): Promise<void>;
}

// `get`, not `getEnforcing`: a missing module (old build, other platform) disables this
// feature instead of crashing the app at startup.
export default TurboModuleRegistry.get<Spec>('DailyReminder');
