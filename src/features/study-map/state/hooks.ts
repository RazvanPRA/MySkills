import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { StudyMapState } from './slice';
import type { StudyMapDependencies } from './thunks';

type WithStudyMap = { studyMap: StudyMapState };

/** Typed hooks for this feature's slice; features never import the app's store types. */
export const useStudyMapDispatch =
  useDispatch.withTypes<ThunkDispatch<WithStudyMap, StudyMapDependencies, UnknownAction>>();
export const useStudyMapSelector = useSelector.withTypes<WithStudyMap>();
