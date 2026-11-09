import type { TopicProgress } from '../model/topicProgress';

/** Where the user's topic progress lives. Local (SQLite) now, Remote later. */
export type TopicProgressRepository = {
  getAll: () => Promise<TopicProgress[]>;
  /** Null when the topic was never touched (i.e. not started). */
  get: (topicId: string) => Promise<TopicProgress | null>;
  /** Inserts or replaces the progress of one topic. */
  save: (progress: TopicProgress) => Promise<void>;
};
