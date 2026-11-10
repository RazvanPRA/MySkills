// Public API of the progress feature: mastery, estimated level, heatmap, streak (brief §8).
export {
  MASTERY_PARAMS,
  MASTERY_WINDOW_DAYS,
  defaultLevelRule,
  type LevelRule,
} from './model/constants';
export type { AttemptFact, CardFact, SessionFact } from './model/facts';
export { calculateTopicMastery } from './services/topicMastery.service';
export { masteryByTopic } from './services/masteryByTopic.service';
export { estimateCategoryLevel } from './services/estimateCategoryLevel.service';
export { buildHeatmap, type HeatmapCell, type HeatmapRow } from './services/buildHeatmap.service';
export { completedDays, computeStreak, type Streak } from './services/computeStreak.service';
export { accuracyByWeek, averageScore, type WeekAccuracy } from './services/accuracy.service';
export { weakTopics, type WeakTopic } from './services/weakTopics.service';
export { suggestTopic, type TopicSuggestion } from './services/suggestTopic.service';
