import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useContentCatalog } from '@/features/content';
import { useLanguage, useStrings } from '@/shared/i18n';
import { presentTodayCard } from '../services/presentTodayCard';
import { selectToday, useDailyTestsDispatch, useDailyTestsSelector } from '../state/hooks';
import { loadToday } from '../state/thunks';

/**
 * Today's cards. Reloads whenever the screen gains focus: after a finished test, after
 * marking topics, and on a new day (the day is recomputed from the clock on every load).
 */
export function useToday() {
  const catalog = useContentCatalog();
  const language = useLanguage();
  const strings = useStrings();
  const dispatch = useDailyTestsDispatch();
  const { cards, status, date } = useDailyTestsSelector(selectToday);

  const reload = useCallback(() => {
    dispatch(loadToday({ catalog }));
  }, [dispatch, catalog]);
  useFocusEffect(reload);

  const models = useMemo(
    () => cards.map(card => presentTodayCard({ card, catalog, strings, language })),
    [cards, catalog, strings, language],
  );
  return { status, date, cards: models, reload };
}
