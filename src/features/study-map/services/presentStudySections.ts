import type { ContentCatalog } from '@/features/content';
import { type Level, resolveText } from '@/shared/domain';
import type { Language, Strings } from '@/shared/i18n';
import type { TopicProgress } from '../model/topicProgress';
import type { TopicGroup } from './filterTopics.service';

export type TopicRowModel = {
  id: string;
  title: string;
  /** The level ("Mid"). */
  meta: string;
  /** Null for topics that are not marked (categories outside the knowledge test). */
  statusLabel: string | null;
};
export type TopicSection = { key: string; label: string; rows: TopicRowModel[] };

type Context = {
  catalog: ContentCatalog;
  strings: Strings;
  language: Language;
  progress: Readonly<Record<string, TopicProgress>>;
};

const categoryTitle = ({ catalog, language }: Context, id: string) => {
  const category = catalog.categoriesById.get(id);
  return category ? resolveText(category.title, language).text : id;
};

/** Pure: groups of topics as translated sections and rows. */
export function presentStudySections(
  groups: readonly TopicGroup[],
  context: Context,
): TopicSection[] {
  const { catalog, strings, language, progress } = context;
  return groups.map(group => ({
    key: group.key,
    label:
      group.kind === 'level'
        ? strings.levels[group.key as Level]
        : categoryTitle(context, group.key),
    rows: group.topics.map(topic => ({
      id: topic.id,
      title: resolveText(topic.title, language).text,
      meta: strings.levels[topic.level],
      statusLabel: catalog.categoriesById.get(topic.categoryId)?.testKinds.includes('knowledge')
        ? strings.topicStatus[progress[topic.id]?.status ?? 'not_started']
        : null,
    })),
  }));
}
