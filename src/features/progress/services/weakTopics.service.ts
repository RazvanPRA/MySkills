import type { ContentCatalog } from '@/features/content';
import { levels } from '@/shared/domain';
import { WEAK_TOPIC_THRESHOLD } from '../model/constants';

export type WeakTopic = { topicId: string; mastery: number };

/** Attempted topics below the weak threshold, weakest first (ties: lower level, then id). */
export function weakTopics(
  catalog: ContentCatalog,
  mastery: ReadonlyMap<string, number>,
  { limit = 5, threshold = WEAK_TOPIC_THRESHOLD } = {},
): WeakTopic[] {
  const levelOf = (topicId: string) =>
    levels.indexOf(catalog.topicsById.get(topicId)?.level ?? 'senior');
  return [...mastery]
    .filter(([topicId, value]) => value < threshold && catalog.topicsById.has(topicId))
    .sort(([a, x], [b, y]) => x - y || levelOf(a) - levelOf(b) || a.localeCompare(b))
    .slice(0, limit)
    .map(([topicId, value]) => ({ topicId, mastery: value }));
}
