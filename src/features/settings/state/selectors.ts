import type { Language } from '@/shared/i18n';
import type { UserSettings } from '../model/userSettings';
import type { SettingsState } from './slice';

/** The minimal root-state shape this feature needs; the app's RootState satisfies it. */
type WithSettings = { settings: SettingsState };

export const selectSettings = (state: WithSettings): UserSettings => state.settings.values;
export const selectLanguage = (state: WithSettings): Language => state.settings.values.language;
export const selectSettingsLoaded = (state: WithSettings): boolean => state.settings.loaded;
