import type { UserSettings } from '../model/userSettings';

/** Small preferences (brief §4: AsyncStorage only for preferences). */
export type SettingsRepository = {
  /** Never fails on bad data: returns defaults for anything invalid. */
  load: () => Promise<UserSettings>;
  save: (settings: UserSettings) => Promise<void>;
};

/** The subset of AsyncStorage this repository needs; an in-memory version is used in tests. */
export type KeyValueStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};
