import type { ContentCatalog, Topic } from '@/features/content';
import type { TestBuildContext, TestScope } from '@/features/daily-tests';
import type { ReviewCard } from '@/features/spaced-repetition';
import { isCovered } from '@/features/study-map';
import type { Level } from '@/shared/domain';
import { KNOWLEDGE_KIND } from '../model/constants';

/** An exercise that may appear in today's knowledge test. */
export type PoolExercise = {
  id: string;
  topicId: string;
  categoryId: string;
  level: Level;
  difficulty: number;
};

const inScope = (topic: Topic, scope: TestScope | undefined): boolean =>
  (!scope?.topicIds || scope.topicIds.includes(topic.id)) &&
  (!scope?.categoryIds || scope.categoryIds.includes(topic.categoryId));

const feedsKnowledge = (catalog: ContentCatalog, topic: Topic): boolean =>
  catalog.categoriesById.get(topic.categoryId)?.testKinds.includes(KNOWLEDGE_KIND) ?? false;

/** Brief §7.1.1: exercises of covered topics, in categories that feed the knowledge test. */
export function buildKnowledgePool({ catalog, progress, scope }: TestBuildContext): PoolExercise[] {
  const coveredIds = progress
    .filter(isCovered)
    .map(entry => entry.topicId)
    .sort();
  return coveredIds.flatMap(topicId => {
    const topic = catalog.topicsById.get(topicId);
    if (!topic || !feedsKnowledge(catalog, topic) || !inScope(topic, scope)) {
      return [];
    }
    return (catalog.exercisesByTopic.get(topicId) ?? []).map(exercise => ({
      id: exercise.id,
      topicId,
      categoryId: topic.categoryId,
      level: exercise.level,
      difficulty: exercise.difficulty,
    }));
  });
}

/** Brief §7.1.2: pool exercises whose card is due by the end of today, most overdue first. */
export function dueExercises(
  pool: readonly PoolExercise[],
  cards: ReadonlyMap<string, ReviewCard>,
  dueBefore: string,
): PoolExercise[] {
  const dueOf = (item: PoolExercise) => cards.get(item.id)?.due ?? '';
  return pool
    .filter(item => cards.has(item.id) && dueOf(item) < dueBefore)
    .sort((a, b) => dueOf(a).localeCompare(dueOf(b)) || a.id.localeCompare(b.id));
}
