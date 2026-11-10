// Public API of the settings feature. The screen is lazy so the index loads without
// react-native (registries.ts reaches it in Node).
import { lazy } from 'react';

export {
  userSettingsSchema,
  defaultUserSettings,
  knowledgeTestLengths,
  logicTestLengths,
  type UserSettings,
} from './model/userSettings';
export { settingsReducer, type SettingsState } from './state/slice';
export { loadSettings, updateSettings, type SettingsDependencies } from './state/thunks';
export { selectSettings, selectLanguage, selectSettingsLoaded } from './state/selectors';
export { useSettings } from './hooks/useSettings';
export type { SettingsRepository, KeyValueStore } from './repository/SettingsRepository';
export {
  createLocalSettingsRepository,
  createMemoryKeyValueStore,
  SETTINGS_STORAGE_KEY,
} from './repository/LocalSettingsRepository';
export type { SettingsScreenProps } from './screens/SettingsScreen';

export const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
