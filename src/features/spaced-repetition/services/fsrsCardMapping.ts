import { type Card, State } from 'ts-fsrs';
import type { ReviewCard, ReviewState } from '../model/reviewCard';

const toState: Record<ReviewState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

const fromState: Record<State, ReviewState> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
};

/** Our stored card → ts-fsrs Card. `elapsed_days` is deprecated in ts-fsrs 5 and recomputed. */
export const toFsrsCard = (card: ReviewCard): Card => ({
  due: new Date(card.due),
  stability: card.stability,
  difficulty: card.difficulty,
  elapsed_days: 0,
  scheduled_days: card.scheduledDays,
  learning_steps: card.learningSteps,
  reps: card.reps,
  lapses: card.lapses,
  state: toState[card.state],
  last_review: card.lastReview ? new Date(card.lastReview) : undefined,
});

/** ts-fsrs Card → our stored card (lossless for every field ts-fsrs 5 still uses). */
export const fromFsrsCard = (exerciseId: string, card: Card): ReviewCard => ({
  exerciseId,
  due: card.due.toISOString(),
  stability: card.stability,
  difficulty: card.difficulty,
  scheduledDays: card.scheduled_days,
  learningSteps: card.learning_steps,
  reps: card.reps,
  lapses: card.lapses,
  state: fromState[card.state],
  ...(card.last_review ? { lastReview: card.last_review.toISOString() } : {}),
});
