import type { ContentCatalog } from '@/features/content';
import type { AttemptFact, CardFact } from '../model/facts';
import { calculateTopicMastery } from './topicMastery.service';

export type MasteryByTopicInput = {
  catalog: ContentCatalog;
  attempts: readonly AttemptFact[];
  cards: readonly CardFact[];
  now: string;
};

/** Groups items by the topic of their exercise; exercises no longer in the catalog are skipped. */
export function groupByTopic<T extends { exerciseId: string }>(
  catalog: ContentCatalog,
  items: readonly T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const topicId = catalog.exercisesById.get(item.exerciseId)?.topicId;
    if (!topicId) {
      continue;
    }
    const group = groups.get(topicId);
    if (group) {
      group.push(item);
    } else {
      groups.set(topicId, [item]);
    }
  }
  return groups;
}

/** Mastery of every attempted topic. Topics missing from the map were never attempted. */
export function masteryByTopic({
  catalog,
  attempts,
  cards,
  now,
}: MasteryByTopicInput): ReadonlyMap<string, number> {
  const cardsByTopic = groupByTopic(catalog, cards);
  const result = new Map<string, number>();
  for (const [topicId, topicAttempts] of groupByTopic(catalog, attempts)) {
    const stabilities = (cardsByTopic.get(topicId) ?? []).map(card => card.stability);
    const mastery = calculateTopicMastery({ attempts: topicAttempts, stabilities, now });
    if (mastery !== null) {
      result.set(topicId, mastery);
    }
  }
  return result;
}
