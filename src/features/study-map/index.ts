// Public API of the study-map feature.
export {
  topicProgressSchema,
  topicStatusSchema,
  topicStatuses,
  isCovered,
  type TopicProgress,
  type TopicStatus,
} from './model/topicProgress';
export type { TopicProgressRepository } from './repository/TopicProgressRepository';
export { createLocalTopicProgressRepository } from './repository/LocalTopicProgressRepository';
