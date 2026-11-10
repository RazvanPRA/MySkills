/*
 * The lean source data progress works from: projections of attempts, review cards and
 * sessions, without answers or FSRS internals it does not need.
 */

export type AttemptFact = {
  exerciseId: string;
  sessionId: string;
  /** 0..1 */
  score: number;
  /** ISO instant. */
  answeredAt: string;
};

export type CardFact = { exerciseId: string; stability: number };

export type SessionFact = {
  id: string;
  /** YYYY-MM-DD, local. */
  date: string;
  testKind: string;
  status: 'pending' | 'in_progress' | 'completed';
  exerciseCount: number;
  score?: number;
};
