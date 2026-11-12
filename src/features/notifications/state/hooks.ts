import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import type { SettingsState } from '@/features/settings';
import type { NotificationsDependencies } from './thunks';

/** Typed dispatch for this feature's thunks (it has no slice of its own). */
export const useNotificationsDispatch =
  useDispatch.withTypes<
    ThunkDispatch<{ settings: SettingsState }, NotificationsDependencies, UnknownAction>
  >();
