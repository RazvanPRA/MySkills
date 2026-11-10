import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import type { SettingsDependencies, SettingsState } from '@/features/settings';
import type { StudyMapDependencies, StudyMapState } from '@/features/study-map';

type WithState = { settings: SettingsState; studyMap: StudyMapState };

/** Typed dispatch for this feature's thunks (it has no slice of its own). */
export const useOnboardingDispatch =
  useDispatch.withTypes<
    ThunkDispatch<WithState, SettingsDependencies & StudyMapDependencies, UnknownAction>
  >();
