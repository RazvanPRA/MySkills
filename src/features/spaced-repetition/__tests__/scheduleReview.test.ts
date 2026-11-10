import { configureStore } from '@reduxjs/toolkit';
import { fixedClock } from '@/shared/utils/clock';
import type { ReviewCard } from '../model/reviewCard';
import type { ReviewCardRepository } from '../repository/ReviewCardRepository';
import { defaultFsrsRating } from '../services/defaultFsrsRating.service';
import { fromFsrsCard, toFsrsCard } from '../services/fsrsCardMapping';
import { scheduleReview } from '../services/scheduleReview.service';
import { reviewExercise } from '../state/thunks';

const NOW = new Date('2026-11-10T08:00:00.000Z');
const DAY_MS = 86_400_000;

const reviewCard: ReviewCard = {
  exerciseId: 'react.hooks.mid.q1',
  due: '2026-11-12T08:00:00.000Z',
  stability: 4.2,
  difficulty: 5.1,
  scheduledDays: 4,
  learningSteps: 0,
  reps: 3,
  lapses: 1,
  state: 'review',
  lastReview: '2026-11-08T08:00:00.000Z',
};

describe('fsrsCardMapping', () => {
  it('round-trips a stored card without losing data', () => {
    expect(fromFsrsCard(reviewCard.exerciseId, toFsrsCard(reviewCard))).toEqual(reviewCard);
  });

  it('round-trips a card that was never reviewed (no lastReview)', () => {
    const fresh: ReviewCard = { ...reviewCard, state: 'new', reps: 0 };
    delete fresh.lastReview;
    expect(fromFsrsCard(fresh.exerciseId, toFsrsCard(fresh))).toEqual(fresh);
  });
});

describe('scheduleReview', () => {
  const first = (rating: 1 | 2 | 3 | 4) =>
    scheduleReview({ exerciseId: 'x', card: null, rating, now: NOW });

  it('starts a new card in learning with a short step when answered Good', () => {
    const card = first(3);
    expect(card).toMatchObject({ exerciseId: 'x', state: 'learning', reps: 1, lapses: 0 });
    expect(card.lastReview).toBe(NOW.toISOString());
    expect(Date.parse(card.due) - NOW.getTime()).toBeLessThan(DAY_MS);
  });

  it('schedules Easy further than Good, and Good further than Again', () => {
    const due = (rating: 1 | 3 | 4) => Date.parse(first(rating).due);
    expect(due(4)).toBeGreaterThan(due(3));
    expect(due(3)).toBeGreaterThan(due(1));
  });

  it('grows the interval on repeated successful reviews', () => {
    let card = first(3);
    const intervals: number[] = [];
    for (let review = 0; review < 4; review += 1) {
      const now = new Date(card.due);
      card = scheduleReview({ exerciseId: 'x', card, rating: 3, now });
      intervals.push(Date.parse(card.due) - now.getTime());
    }
    expect(card.state).toBe('review');
    intervals.slice(1).forEach((interval, index) => {
      expect(interval).toBeGreaterThan(intervals[index] as number);
    });
  });

  it('counts a lapse when a review card is forgotten', () => {
    const now = new Date(reviewCard.due);
    const card = scheduleReview({
      exerciseId: reviewCard.exerciseId,
      card: reviewCard,
      rating: 1,
      now,
    });
    expect(card).toMatchObject({ state: 'relearning', lapses: 2, reps: 4 });
  });

  it('is deterministic', () => {
    expect(first(2)).toEqual(first(2));
  });
});

describe('defaultFsrsRating', () => {
  it.each([
    [{ correct: true, score: 1 }, undefined, 3],
    [{ correct: true, score: 1 }, 4, 4],
    [{ correct: false, score: 0.67 }, undefined, 2],
    [{ correct: false, score: 0.5 }, undefined, 2],
    [{ correct: false, score: 0.33 }, undefined, 1],
    [{ correct: false, score: 0 }, 4, 1],
  ] as const)('%j with confidence %s → %i', (result, confidence, expected) => {
    expect(defaultFsrsRating(result, confidence)).toBe(expected);
  });
});

describe('reviewExercise', () => {
  function setup(existing: ReviewCard | null) {
    const saved: ReviewCard[] = [];
    const reviewCards: ReviewCardRepository = {
      getAll: async () => [],
      getDue: async () => [],
      get: async () => existing,
      save: async card => {
        saved.push(card);
      },
    };
    const store = configureStore({
      reducer: () => null,
      middleware: getDefault =>
        getDefault({
          thunk: {
            extraArgument: { clock: fixedClock(NOW.toISOString()), repositories: { reviewCards } },
          },
        }),
    });
    return { store, saved };
  }

  it('creates and stores a card for a first review', async () => {
    const { store, saved } = setup(null);
    const card = await store.dispatch(reviewExercise({ exerciseId: 'q1', rating: 3 })).unwrap();
    expect(saved).toEqual([card]);
    expect(card).toMatchObject({ exerciseId: 'q1', reps: 1, lastReview: NOW.toISOString() });
  });

  it('continues from the stored card', async () => {
    const { store } = setup(reviewCard);
    const card = await store
      .dispatch(reviewExercise({ exerciseId: reviewCard.exerciseId, rating: 3 }))
      .unwrap();
    expect(card.reps).toBe(reviewCard.reps + 1);
  });
});
