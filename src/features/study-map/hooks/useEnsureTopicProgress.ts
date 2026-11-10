import { useCallback, useEffect } from 'react';
import { selectStudyMapStatus } from '../state/selectors';
import { useStudyMapDispatch, useStudyMapSelector } from '../state/hooks';
import { loadTopicProgress } from '../state/thunks';

/** Loads the user's topic progress once; returns the load status and a retry. */
export function useEnsureTopicProgress() {
  const dispatch = useStudyMapDispatch();
  const status = useStudyMapSelector(selectStudyMapStatus);
  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadTopicProgress());
    }
  }, [dispatch, status]);
  const retry = useCallback(() => dispatch(loadTopicProgress()), [dispatch]);
  return { status, retry };
}
