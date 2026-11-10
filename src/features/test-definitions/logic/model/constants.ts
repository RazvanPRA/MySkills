/** Brief §7.2: the logic test (default 5 problems, ~15 minutes). */
export const LOGIC_KIND = 'logic';

/** Adaptive difficulty: aim for 70–80% accuracy over the last 7 days. */
export const ACCURACY_WINDOW_DAYS = 7;
export const TARGET_ACCURACY = { min: 0.7, max: 0.8 } as const;
/** Above the band the average difficulty goes up by 0.5, below it down by 0.5. */
export const DIFFICULTY_STEP = 0.5;
export const DIFFICULTY_BOUNDS = { min: 1, max: 5 } as const;
/** Starting point without any logic attempts in the window. */
export const DEFAULT_TARGET_DIFFICULTY = 2.5;

/** Problems seen in the last 30 days are used only when nothing fresher is left. */
export const NO_REPEAT_DAYS = 30;

/** At least 3 different subcategories per day (fewer only if the pool has fewer). */
export const MIN_SUBCATEGORIES = 3;

/**
 * Slot targets spread from target − 1 to target + 1: a warm-up first, a harder problem last,
 * while the average stays on target.
 */
export const DIFFICULTY_SPREAD = 1;

/** Picking a subcategory again costs as much as 1.5 difficulty points of mismatch. */
export const REPEAT_SUBCATEGORY_COST = 1.5;
