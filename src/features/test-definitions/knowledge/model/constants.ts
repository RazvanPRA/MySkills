/** Brief §7.1, expressed as shares so they scale with the chosen test length (5/10/15). */
export const KNOWLEDGE_KIND = 'knowledge';

/** Due reviews: at most 60% of the test (6 of 10). */
export const DUE_SHARE = 0.6;
/** New exercises: at most 30% (3 of 10), weighted toward weak categories. */
export const NEW_SHARE = 0.3;
/** One "stretch" exercise: senior level, difficulty ≥ 4. */
export const STRETCH_COUNT = 1;
export const STRETCH_LEVEL = 'senior';
export const STRETCH_MIN_DIFFICULTY = 4;

/** Variety: at most 3 exercises from one category (relaxed only if the pool is too small). */
export const MAX_PER_CATEGORY = 3;

/** Accuracy assumed for a category without recent attempts. */
export const NEUTRAL_ACCURACY = 0.5;
/** Keeps strong categories possible (never weight 0). */
export const MIN_NEW_WEIGHT = 0.1;

export type KnowledgeQuotas = { due: number; fresh: number; stretch: number };

export const knowledgeQuotas = (length: number): KnowledgeQuotas => ({
  due: Math.round(length * DUE_SHARE),
  fresh: Math.round(length * NEW_SHARE),
  stretch: STRETCH_COUNT,
});
