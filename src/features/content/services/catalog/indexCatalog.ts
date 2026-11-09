import { type Level, levels } from '@/shared/domain';
import type { ContentCatalog } from '../../model/catalog';
import type { Category, Exercise, PackInfo, Topic } from '../../model/schemas';

const levelRank = (level: Level): number => levels.indexOf(level);

const byOrderThenId = (a: Category, b: Category) => a.order - b.order || a.id.localeCompare(b.id);
const byLevelThenId = (a: Topic, b: Topic) =>
  levelRank(a.level) - levelRank(b.level) || a.id.localeCompare(b.id);
const byId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);

function groupBy<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

type CatalogParts = {
  packs: PackInfo[];
  categories: Category[];
  topics: Topic[];
  exercises: Exercise[];
};

/** Builds the immutable, indexed catalog from already validated entities. */
export function indexCatalog({
  packs,
  categories,
  topics,
  exercises,
}: CatalogParts): ContentCatalog {
  return {
    packs,
    categories: [...categories].sort(byOrderThenId),
    categoriesById: new Map(categories.map(c => [c.id, c])),
    topicsById: new Map(topics.map(t => [t.id, t])),
    topicsByCategory: groupBy([...topics].sort(byLevelThenId), t => t.categoryId),
    exercisesById: new Map(exercises.map(e => [e.id, e])),
    exercisesByTopic: groupBy([...exercises].sort(byId), e => e.topicId),
  };
}
