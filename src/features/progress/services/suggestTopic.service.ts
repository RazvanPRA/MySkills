import type { ContentCatalog } from '@/features/content';
import { isCovered, type TopicProgress } from '@/features/study-map';
import { levels } from '@/shared/domain';
import { weakTopics } from './weakTopics.service';

export type TopicSuggestion = { topicId: string; reason: 'weak' | 'next' };

export type SuggestTopicInput = {
  catalog: ContentCatalog;
  progress: Readonly<Record<string, TopicProgress>>;
  mastery: ReadonlyMap<string, number>;
};

/** The next knowledge topic to study: not started, all prerequisites covered, lowest level. */
function nextTopic({ catalog, progress }: SuggestTopicInput): string | null {
  const covered = (topicId: string) => {
    const entry = progress[topicId];
    return entry !== undefined && isCovered(entry);
  };
  for (const level of levels) {
    for (const category of catalog.categories) {
      if (!category.testKinds.includes('knowledge')) {
        continue;
      }
      const candidate = (catalog.topicsByCategory.get(category.id) ?? []).find(
        topic => topic.level === level && !covered(topic.id) && topic.prerequisites.every(covered),
      );
      if (candidate) {
        return candidate.id;
      }
    }
  }
  return null;
}

/**
 * Today's suggested topic (brief §9.2): the weakest attempted topic to re-read, otherwise the
 * next topic to start. Null when everything is covered and nothing is weak.
 */
export function suggestTopic(input: SuggestTopicInput): TopicSuggestion | null {
  const [weakest] = weakTopics(input.catalog, input.mastery, { limit: 1 });
  if (weakest) {
    return { topicId: weakest.topicId, reason: 'weak' };
  }
  const next = nextTopic(input);
  return next ? { topicId: next, reason: 'next' } : null;
}
