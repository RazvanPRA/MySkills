import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useContentCatalog } from '@/features/content';
import { useEnsureTopicProgress } from '@/features/study-map';
import { masteryByTopic } from '../services/masteryByTopic.service';
import { selectProgress } from '../state/selectors';
import { useProgressDispatch, useProgressSelector } from '../state/hooks';
import { loadProgress } from '../state/thunks';

/**
 * Progress source data, reloaded whenever the screen gains focus (after a finished test,
 * on a new day), plus topic mastery derived from it.
 */
export function useProgressData() {
  const catalog = useContentCatalog();
  const dispatch = useProgressDispatch();
  const progress = useProgressSelector(selectProgress);
  useEnsureTopicProgress();

  const reload = useCallback(() => {
    dispatch(loadProgress());
  }, [dispatch]);
  useFocusEffect(reload);

  const { attempts, cards, now } = progress;
  const mastery = useMemo(
    () =>
      now === null ? new Map<string, number>() : masteryByTopic({ catalog, attempts, cards, now }),
    [catalog, attempts, cards, now],
  );
  return { status: progress.status, mastery, reload };
}
