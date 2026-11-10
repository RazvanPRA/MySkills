import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  type SessionRepository,
  type TestRegistry,
  testsWithSchedule,
} from '@/features/daily-tests';
import type { AttemptRepository } from '@/features/session-player';
import type { ReviewCardRepository } from '@/features/spaced-repetition';
import type { Clock } from '@/shared/utils/clock';
import { addDays, parseLocalDate, toLocalDate } from '@/shared/utils/localDate';
import { MASTERY_WINDOW_DAYS } from '../model/constants';
import { toAttemptFact, toCardFact, toSessionFact } from '../services/toFacts';
import type { ProgressState } from './slice';

/** What this feature needs from the dependency container. */
export type ProgressDependencies = {
  clock: Clock;
  registries: { tests: TestRegistry };
  repositories: {
    attempts: AttemptRepository;
    reviewCards: ReviewCardRepository;
    sessions: SessionRepository;
  };
};

type Loaded = Omit<ProgressState, 'status'>;

/** Reads the last year of attempts and sessions, and every review card. */
export const loadProgress = createAsyncThunk<Loaded, void, { extra: ProgressDependencies }>(
  'progress/load',
  async (_, { extra }) => {
    const now = extra.clock.now();
    const today = toLocalDate(now);
    const from = addDays(today, -MASTERY_WINDOW_DAYS);
    const { attempts, reviewCards, sessions } = extra.repositories;
    const [attemptRows, cardRows, sessionRows] = await Promise.all([
      attempts.listSince(parseLocalDate(from).toISOString()),
      reviewCards.getAll(),
      sessions.listBetween(from, today),
    ]);
    return {
      now: now.toISOString(),
      today,
      attempts: attemptRows.map(toAttemptFact),
      cards: cardRows.map(toCardFact),
      sessions: sessionRows.map(toSessionFact),
      dailyKinds: testsWithSchedule(extra.registries.tests, 'daily').map(test => test.kind),
      testTitles: Object.fromEntries(
        extra.registries.tests.list().map(test => [test.kind, test.title]),
      ),
    };
  },
);
