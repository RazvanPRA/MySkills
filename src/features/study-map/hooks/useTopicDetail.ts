import { useCallback, useMemo } from 'react';
import { useContentCatalog } from '@/features/content';
import { resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { type TopicStatus, topicStatuses } from '../model/topicProgress';
import { selectTopicStatus } from '../state/selectors';
import { useStudyMapDispatch, useStudyMapSelector } from '../state/hooks';
import { setTopicStatus } from '../state/thunks';

/** One topic, in the UI language, with its status and a way to change it. */
export function useTopicDetail(topicId: string) {
  const catalog = useContentCatalog();
  const language = useLanguage();
  const strings = useStrings();
  const dispatch = useStudyMapDispatch();
  const status = useStudyMapSelector(state => selectTopicStatus(state, topicId));
  const topic = catalog.topicsById.get(topicId);

  const view = useMemo(() => {
    if (!topic) {
      return null;
    }
    const title = resolveText(topic.title, language);
    const summary = resolveText(topic.summary, language);
    const category = catalog.categoriesById.get(topic.categoryId);
    const categoryTitle = category ? resolveText(category.title, language).text : '';
    return {
      title: title.text,
      subtitle: `${categoryTitle} · ${strings.levels[topic.level]}`,
      summary: summary.text,
      isFallback: title.isFallback || summary.isFallback,
      resources: topic.resources,
      // Only topics of knowledge categories feed a test when marked (brief §7.1).
      markable: category?.testKinds.includes('knowledge') ?? false,
      exerciseCount: catalog.exercisesByTopic.get(topic.id)?.length ?? 0,
    };
  }, [topic, catalog, language, strings]);

  const statusOptions = useMemo(
    () => topicStatuses.map(id => ({ id, label: strings.topicStatus[id] })),
    [strings],
  );
  const changeStatus = useCallback(
    (next: TopicStatus) => dispatch(setTopicStatus({ topicId, status: next })),
    [dispatch, topicId],
  );
  return { view, status, statusOptions, changeStatus };
}
