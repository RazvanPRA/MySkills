import { useEffect, useMemo } from 'react';
import { useContentCatalog } from '@/features/content';
import { resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { summarizeSession } from '../services/summarizeSession.service';
import { selectPlayer, useSessionPlayerDispatch, useSessionPlayerSelector } from '../state/hooks';
import { openSession } from '../state/thunks';

export type ReviewRowModel = { topicId: string; title: string; meta: string };

/** The finished session's summary and the topics to re-read, in the UI language. */
export function useSessionResults(sessionId: string) {
  const catalog = useContentCatalog();
  const language = useLanguage();
  const strings = useStrings();
  const dispatch = useSessionPlayerDispatch();
  const player = useSessionPlayerSelector(selectPlayer);
  const loaded = player.status === 'ready' && player.session?.id === sessionId;

  useEffect(() => {
    if (!loaded) {
      dispatch(openSession({ sessionId, catalog }));
    }
  }, [loaded, dispatch, sessionId, catalog]);

  return useMemo(() => {
    if (!loaded) {
      return null;
    }
    const summary = summarizeSession(player.exerciseIds, player.attempts, catalog);
    const rows: ReviewRowModel[] = summary.toReview.flatMap(({ topicId, mistakes }) => {
      const topic = catalog.topicsById.get(topicId);
      return topic
        ? [
            {
              topicId,
              title: resolveText(topic.title, language).text,
              meta: `${strings.levels[topic.level]} · ${strings.counts.mistakes(mistakes)}`,
            },
          ]
        : [];
    });
    return { summary, rows };
  }, [loaded, player.exerciseIds, player.attempts, catalog, language, strings]);
}
