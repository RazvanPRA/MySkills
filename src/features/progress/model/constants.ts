/** Tuning of topic mastery (brief §8). Exported so tests and docs show the real values. */
export const MASTERY_PARAMS = {
  /** An attempt counts half as much after this many days. */
  halfLifeDays: 30,
  /**
   * Weight of an imaginary 0% attempt: one correct answer gives 50%, three give 75%.
   * Mastery needs repeated evidence, not one lucky answer.
   */
  priorWeight: 1,
  /** FSRS stability (days) that counts as 50% "remembered". */
  stabilityHalfDays: 21,
  /** Share of FSRS stability in the result when the topic has review cards. */
  stabilityShare: 0.3,
} as const;
export type MasteryParams = typeof MASTERY_PARAMS;

/** How far back attempts are read for mastery: older ones weigh almost nothing. */
export const MASTERY_WINDOW_DAYS = 365;

/**
 * Estimated level rule (brief §8): a level is reached with ≥ `masteryThreshold` mastery on
 * ≥ `coverage` of the topics at that level and below.
 */
export type LevelRule = { masteryThreshold: number; coverage: number };
export const defaultLevelRule: LevelRule = { masteryThreshold: 70, coverage: 0.8 };

/** Topics below this mastery (with at least one attempt) are weak spots. */
export const WEAK_TOPIC_THRESHOLD = 60;
