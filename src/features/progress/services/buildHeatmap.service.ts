import type { ContentCatalog } from '@/features/content';
import { type Level, levels } from '@/shared/domain';
import { defaultLevelRule, type LevelRule } from '../model/constants';
import { estimateCategoryLevel, type TopicLevelMastery } from './estimateCategoryLevel.service';

export type HeatmapCell = {
  level: Level;
  /** Topics at this level that have exercises (0: nothing to measure yet). */
  topicCount: number;
  /** Average mastery, unattempted topics counting as 0; null when none was attempted. */
  mastery: number | null;
};

export type HeatmapRow = {
  categoryId: string;
  cells: HeatmapCell[];
  estimatedLevel: Level | null;
};

function cellFor(level: Level, topics: readonly TopicLevelMastery[]): HeatmapCell {
  const atLevel = topics.filter(topic => topic.level === level);
  const attempted = atLevel.filter(topic => topic.mastery !== null);
  const total = atLevel.reduce((sum, topic) => sum + (topic.mastery ?? 0), 0);
  return {
    level,
    topicCount: atLevel.length,
    mastery: attempted.length === 0 ? null : Math.round(total / atLevel.length),
  };
}

/**
 * Categories × levels (brief §8), the same shape as the competency matrix. Only topics with
 * exercises count: a topic without exercises cannot be measured.
 */
export function buildHeatmap(
  catalog: ContentCatalog,
  mastery: ReadonlyMap<string, number>,
  rule: LevelRule = defaultLevelRule,
): HeatmapRow[] {
  return catalog.categories.map(category => {
    const topics = (catalog.topicsByCategory.get(category.id) ?? [])
      .filter(topic => (catalog.exercisesByTopic.get(topic.id)?.length ?? 0) > 0)
      .map(topic => ({ level: topic.level, mastery: mastery.get(topic.id) ?? null }));
    return {
      categoryId: category.id,
      cells: levels.map(level => cellFor(level, topics)),
      estimatedLevel: estimateCategoryLevel(topics, rule),
    };
  });
}
