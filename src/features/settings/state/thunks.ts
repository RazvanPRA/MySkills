import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserSettings } from '../model/userSettings';
import type { SettingsRepository } from '../repository/SettingsRepository';
import type { SettingsState } from './slice';

/** What this feature needs from the dependency container (the app's container satisfies it). */
export type SettingsDependencies = { repositories: { settings: SettingsRepository } };

type ThunkConfig = { extra: SettingsDependencies; state: { settings: SettingsState } };

export const loadSettings = createAsyncThunk<UserSettings, void, ThunkConfig>(
  'settings/load',
  (_, { extra }) => extra.repositories.settings.load(),
);

export const updateSettings = createAsyncThunk<UserSettings, Partial<UserSettings>, ThunkConfig>(
  'settings/update',
  async (changes, { extra, getState }) => {
    // `pending` already merged the changes into the state.
    const next = { ...getState().settings.values, ...changes };
    await extra.repositories.settings.save(next);
    return next;
  },
);
