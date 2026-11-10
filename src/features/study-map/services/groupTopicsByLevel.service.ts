import type { Topic } from '@/features/content';
import { type Level, levels } from '@/shared/domain';

export type LevelGroup = { level: Level; topics: Topic[] };

/** Pure: topics grouped Junior → Mid → Senior, keeping their order; empty levels are left out. */
export const groupTopicsByLevel = (topics: readonly Topic[]): LevelGroup[] =>
  levels
    .map(level => ({ level, topics: topics.filter(topic => topic.level === level) }))
    .filter(group => group.topics.length > 0);
