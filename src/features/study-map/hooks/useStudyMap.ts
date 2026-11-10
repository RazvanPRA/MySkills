import { useMemo, useState } from 'react';
import { useContentCatalog } from '@/features/content';
import { resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { groupTopicsByLevel } from '../services/groupTopicsByLevel.service';
import { selectTopicProgressById } from '../state/selectors';
import { useStudyMapSelector } from '../state/hooks';

export type TopicRowModel = { id: string; title: string; meta: string; statusLabel: string };
export type TopicSection = { level: string; label: string; rows: TopicRowModel[] };

/** Category tabs and the selected category's topics grouped by level, with their status. */
export function useStudyMap() {
  const catalog = useContentCatalog();
  const language = useLanguage();
  const strings = useStrings();
  const progress = useStudyMapSelector(selectTopicProgressById);
  const [selectedId, setSelectedId] = useState(catalog.categories[0]?.id ?? null);

  const tabs = useMemo(
    () => catalog.categories.map(c => ({ id: c.id, label: resolveText(c.title, language).text })),
    [catalog, language],
  );
  const sections = useMemo((): TopicSection[] => {
    const topics = selectedId ? catalog.topicsByCategory.get(selectedId) ?? [] : [];
    return groupTopicsByLevel(topics).map(group => ({
      level: group.level,
      label: strings.levels[group.level],
      rows: group.topics.map(topic => ({
        id: topic.id,
        title: resolveText(topic.title, language).text,
        meta: strings.levels[topic.level],
        statusLabel: strings.topicStatus[progress[topic.id]?.status ?? 'not_started'],
      })),
    }));
  }, [catalog, selectedId, progress, language, strings]);

  return { tabs, selectedId, select: setSelectedId, sections };
}
