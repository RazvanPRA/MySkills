import { useMemo } from 'react';
import { useContentCatalog } from '@/features/content';
import { selectTopicProgressById } from '@/features/study-map';
import { useLanguage, useStrings } from '@/shared/i18n';
import { presentTodayStats } from '../services/presentTodayStats';
import { suggestTopic } from '../services/suggestTopic.service';
import { selectStreak, selectWeekAccuracy } from '../state/selectors';
import { useProgressSelector } from '../state/hooks';
import { useProgressData } from './useProgressData';

/** Streak, 7-day accuracy and the suggested topic for Today. */
export function useTodayStats() {
  const catalog = useContentCatalog();
  const strings = useStrings();
  const language = useLanguage();
  const { status, mastery } = useProgressData();
  const streak = useProgressSelector(selectStreak);
  const week = useProgressSelector(selectWeekAccuracy);
  const progress = useProgressSelector(selectTopicProgressById);

  const model = useMemo(() => {
    const suggestion = suggestTopic({ catalog, progress, mastery });
    return presentTodayStats({ streak, week, suggestion, mastery, catalog, strings, language });
  }, [streak, week, catalog, progress, mastery, strings, language]);
  return { ready: status === 'ready', ...model };
}
