import type { ContentCatalog, Topic } from '@/features/content';
import { LOGIC_KIND } from '../model/constants';

/** An exercise that may appear in today's logic test. */
export type LogicCandidate = {
  id: string;
  topicId: string;
  /** The topic without its level: logic.event-loop.mid → logic.event-loop. */
  subcategory: string;
  difficulty: number;
};

/**
 * Logic topics are subcategory × level (logic.event-loop.junior / .mid / .senior), like the
 * competency matrix rows; the subcategory is the topic id without its level suffix.
 */
export function subcategoryOf(topic: Pick<Topic, 'id' | 'level'>): string {
  const suffix = `.${topic.level}`;
  return topic.id.endsWith(suffix) ? topic.id.slice(0, -suffix.length) : topic.id;
}

/** Brief §7.2.1: every exercise of the categories that feed the logic test. */
export function buildLogicPool(catalog: ContentCatalog): LogicCandidate[] {
  return catalog.categories
    .filter(category => category.testKinds.includes(LOGIC_KIND))
    .flatMap(category => catalog.topicsByCategory.get(category.id) ?? [])
    .flatMap(topic =>
      (catalog.exercisesByTopic.get(topic.id) ?? []).map(exercise => ({
        id: exercise.id,
        topicId: topic.id,
        subcategory: subcategoryOf(topic),
        difficulty: exercise.difficulty,
      })),
    );
}
