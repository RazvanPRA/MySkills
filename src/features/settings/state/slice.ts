import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultLanguage, type Language } from '@/shared/i18n';

export type SettingsState = {
  language: Language;
};

export const initialSettingsState: SettingsState = {
  language: defaultLanguage,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettingsState,
  reducers: {
    languageChanged(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
  },
});

export const { languageChanged } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
