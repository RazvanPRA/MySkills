import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import type { BackupDependencies } from './thunks';

/** Typed dispatch for this feature's thunks (it has no slice of its own). */
export const useBackupDispatch =
  useDispatch.withTypes<ThunkDispatch<unknown, BackupDependencies, UnknownAction>>();
