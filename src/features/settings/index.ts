// Public API of the settings feature.
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
export type { SettingsRepository, KeyValueStore } from './repository/SettingsRepository';
export {
  createLocalSettingsRepository,
  createMemoryKeyValueStore,
  SETTINGS_STORAGE_KEY,
} from './repository/LocalSettingsRepository';
