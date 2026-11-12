import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UserSettings } from '../model/userSettings';
import { selectSettings } from '../state/selectors';
import type { SettingsState } from '../state/slice';
import { type SettingsDependencies, updateSettings } from '../state/thunks';

type WithSettings = { settings: SettingsState };

const useSettingsDispatch =
  useDispatch.withTypes<ThunkDispatch<WithSettings, SettingsDependencies, UnknownAction>>();

/** The user's settings and a way to change some of them (saved in the background). */
export function useSettings() {
  const dispatch = useSettingsDispatch();
  const settings = useSelector(selectSettings);
  const update = useCallback(
    (changes: Partial<UserSettings>) => {
      dispatch(updateSettings(changes));
    },
    [dispatch],
  );
  return { settings, update };
}
