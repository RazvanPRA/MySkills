import type { DailySession } from '@/features/daily-tests';
import type { Attempt } from '@/features/session-player';
import type { ReviewCard } from '@/features/spaced-repetition';
import type { AttemptFact, CardFact, SessionFact } from '../model/facts';

/** Projections that keep only what progress needs (smaller store, no answers). */
export const toAttemptFact = (attempt: Attempt): AttemptFact => ({
  exerciseId: attempt.exerciseId,
  sessionId: attempt.sessionId,
  score: attempt.result.score,
  answeredAt: attempt.answeredAt,
});

export const toCardFact = (card: ReviewCard): CardFact => ({
  exerciseId: card.exerciseId,
  stability: card.stability,
});

export const toSessionFact = (session: DailySession): SessionFact => ({
  id: session.id,
  date: session.date,
  testKind: session.testKind,
  status: session.status,
  exerciseCount: session.exerciseIds.length,
  ...(session.score === undefined ? {} : { score: session.score }),
});
