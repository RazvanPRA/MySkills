import { createSlice } from '@reduxjs/toolkit';
import { defaultUserSettings, type UserSettings } from '../model/userSettings';
import { loadSettings, updateSettings } from './thunks';

export type SettingsState = {
  values: UserSettings;
  /** False until the stored settings were read at startup. */
  loaded: boolean;
};

export const initialSettingsState: SettingsState = {
  values: defaultUserSettings,
  loaded: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettingsState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.values = action.payload;
        state.loaded = true;
      })
      // Optimistic: the UI reflects the choice immediately; it is saved in the background.
      .addCase(updateSettings.pending, (state, action) => {
        state.values = { ...state.values, ...action.meta.arg };
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.values = action.payload;
      });
  },
});

export const settingsReducer = settingsSlice.reducer;
