import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { SettingsState } from '@/features/settings';
import type { DailyTestsState } from './slice';
import type { DailyTestsDependencies } from './thunks';

type WithDailyTests = { dailyTests: DailyTestsState; settings: SettingsState };

/** Typed hooks for this feature's slice; features never import the app's store types. */
export const useDailyTestsDispatch =
  useDispatch.withTypes<ThunkDispatch<WithDailyTests, DailyTestsDependencies, UnknownAction>>();
export const useDailyTestsSelector = useSelector.withTypes<WithDailyTests>();

export const selectToday = (state: WithDailyTests) => state.dailyTests;
