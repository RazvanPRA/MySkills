// Domain primitives shared by every feature. Types are inferred from zod schemas.
export { levels, levelSchema, type Level } from './level';
export {
  localizedTextSchema,
  resolveText,
  type LocalizedText,
  type ResolvedText,
} from './localizedText';
export { contentIdSchema, localDateSchema, isoDateTimeSchema } from './ids';
export {
  creditSchema,
  evaluationResultSchema,
  reviewRatingSchema,
  reviewRatings,
  type Credit,
  type EvaluationResult,
  type ReviewRating,
} from './evaluation';
export {
  choiceOptionsSchema,
  optionIndexSchema,
  MIN_CHOICE_OPTIONS,
  MAX_CHOICE_OPTIONS,
} from './choice';
