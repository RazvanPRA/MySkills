import type { Category, Exercise, PackInfo, Topic } from './schemas';

/**
 * Valid, indexed content: the only content the rest of the app sees.
 * Immutable; built once at startup by `buildContentCatalog`.
 */
export type ContentCatalog = {
  packs: readonly PackInfo[];
  /** Sorted by `order`, then id. */
  categories: readonly Category[];
  categoriesById: ReadonlyMap<string, Category>;
  topicsById: ReadonlyMap<string, Topic>;
  /** Topics of each category, sorted by level then id. */
  topicsByCategory: ReadonlyMap<string, readonly Topic[]>;
  exercisesById: ReadonlyMap<string, Exercise>;
  /** Exercises of each topic, sorted by id. */
  exercisesByTopic: ReadonlyMap<string, readonly Exercise[]>;
};
