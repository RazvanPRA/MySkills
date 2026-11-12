import { type Level, levels } from '@/shared/domain';
import { defaultLevelRule, type LevelRule } from '../model/constants';

/** One assessable topic (it has exercises); `mastery` is null when never attempted. */
export type TopicLevelMastery = { level: Level; mastery: number | null };

/**
 * Estimated level of a category (brief §8): the highest level L such that the category has
 * topics at L, and ≥ `coverage` of its topics at L and below have ≥ `masteryThreshold`.
 * Null when not even Junior is reached.
 */
export function estimateCategoryLevel(
  topics: readonly TopicLevelMastery[],
  rule: LevelRule = defaultLevelRule,
): Level | null {
  for (const candidate of [...levels].reverse()) {
    if (!topics.some(topic => topic.level === candidate)) {
      continue;
    }
    const rank = levels.indexOf(candidate);
    const scope = topics.filter(topic => levels.indexOf(topic.level) <= rank);
    const strong = scope.filter(topic => (topic.mastery ?? 0) >= rule.masteryThreshold);
    if (strong.length / scope.length >= rule.coverage) {
      return candidate;
    }
  }
  return null;
}
