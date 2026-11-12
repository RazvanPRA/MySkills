import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { StudyMapState } from '@/features/study-map';
import type { WithProgress } from './selectors';
import type { ProgressDependencies } from './thunks';

type WithProgressAndStudy = WithProgress & { studyMap: StudyMapState };

/** Typed hooks for this feature's slice; features never import the app's store types. */
export const useProgressDispatch =
  useDispatch.withTypes<ThunkDispatch<WithProgress, ProgressDependencies, UnknownAction>>();
export const useProgressSelector = useSelector.withTypes<WithProgressAndStudy>();
