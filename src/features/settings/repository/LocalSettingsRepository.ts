import { parseStoredSettings } from '../services/parseStoredSettings.service';
import type { KeyValueStore, SettingsRepository } from './SettingsRepository';

export const SETTINGS_STORAGE_KEY = 'seniorprep/settings/v1';

export function createLocalSettingsRepository(store: KeyValueStore): SettingsRepository {
  return {
    load: async () => parseStoredSettings(await store.getItem(SETTINGS_STORAGE_KEY)),
    save: settings => store.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)),
  };
}

/** In-memory KeyValueStore (tests, previews). */
export function createMemoryKeyValueStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = new Map(Object.entries(initial));
  return {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
  };
}
