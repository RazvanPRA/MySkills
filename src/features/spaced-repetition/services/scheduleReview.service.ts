import { createEmptyCard, fsrs, type Grade } from 'ts-fsrs';
import type { ReviewRating } from '@/shared/domain';
import type { ReviewCard } from '../model/reviewCard';
import { fromFsrsCard, toFsrsCard } from './fsrsCardMapping';

// Default FSRS parameters; fuzz stays off so scheduling is deterministic and testable.
const scheduler = fsrs();

type ReviewInput = {
  exerciseId: string;
  /** The current card, or null the first time the exercise is answered. */
  card: ReviewCard | null;
  /** 1 Again · 2 Hard · 3 Good · 4 Easy (same values as ts-fsrs Rating). */
  rating: ReviewRating;
  now: Date;
};

/** Pure: applies one review to a card and returns the next scheduling state. */
export function scheduleReview({ exerciseId, card, rating, now }: ReviewInput): ReviewCard {
  const current = card ? toFsrsCard(card) : createEmptyCard(now);
  const { card: next } = scheduler.next(current, now, rating as Grade);
  return fromFsrsCard(exerciseId, next);
}
