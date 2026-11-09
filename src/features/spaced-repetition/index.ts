// Public API of the spaced-repetition feature.
export {
  reviewCardSchema,
  reviewStateSchema,
  reviewStates,
  type ReviewCard,
  type ReviewState,
} from './model/reviewCard';
export type { ReviewCardRepository } from './repository/ReviewCardRepository';
export { createLocalReviewCardRepository } from './repository/LocalReviewCardRepository';
export { scheduleReview } from './services/scheduleReview.service';
export { defaultFsrsRating } from './services/defaultFsrsRating.service';
export { reviewExercise, type SpacedRepetitionDependencies } from './state/thunks';
