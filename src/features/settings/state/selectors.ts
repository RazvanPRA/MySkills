import type { Language } from '@/shared/i18n';
import type { SettingsState } from './slice';

/** The minimal root-state shape this feature needs; the app's RootState satisfies it. */
type WithSettings = { settings: SettingsState };

export const selectLanguage = (state: WithSettings): Language => state.settings.language;
