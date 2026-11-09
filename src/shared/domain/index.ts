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
  evaluationResultSchema,
  reviewRatingSchema,
  type EvaluationResult,
  type ReviewRating,
} from './evaluation';
