import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ReviewRating } from '@/shared/domain';
import type { Clock } from '@/shared/utils/clock';
import type { ReviewCard } from '../model/reviewCard';
import type { ReviewCardRepository } from '../repository/ReviewCardRepository';
import { scheduleReview } from '../services/scheduleReview.service';

/** What this feature needs from the dependency container. */
export type SpacedRepetitionDependencies = {
  clock: Clock;
  repositories: { reviewCards: ReviewCardRepository };
};

type ReviewArgs = { exerciseId: string; rating: ReviewRating };

/** Applies one review (FSRS) to an exercise's card and stores the result. */
export const reviewExercise = createAsyncThunk<
  ReviewCard,
  ReviewArgs,
  { extra: SpacedRepetitionDependencies }
>('spacedRepetition/review', async ({ exerciseId, rating }, { extra }) => {
  const card = await extra.repositories.reviewCards.get(exerciseId);
  const next = scheduleReview({ exerciseId, card, rating, now: extra.clock.now() });
  await extra.repositories.reviewCards.save(next);
  return next;
});
