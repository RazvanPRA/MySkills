import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ContentCatalog, Exercise, ExerciseTypeRegistry } from '@/features/content';
import {
  availableExerciseIds,
  type DailySession,
  type SessionRepository,
  type TestRegistry,
} from '@/features/daily-tests';
import { reviewExercise, type SpacedRepetitionDependencies } from '@/features/spaced-repetition';
import type { LocalizedText } from '@/shared/domain';
import type { Clock } from '@/shared/utils/clock';
import type { IdGenerator } from '@/shared/utils/idGenerator';
import type { Attempt } from '../model/attempt';
import type { AttemptRepository } from '../repository/AttemptRepository';
import { buildAttempt } from '../services/buildAttempt.service';
import { progressSession } from '../services/progressSession.service';
import type { SessionPlayerState } from './slice';

/** What this feature needs from the dependency container. */
export type SessionPlayerDependencies = SpacedRepetitionDependencies & {
  clock: Clock;
  generateId: IdGenerator;
  registries: { exerciseTypes: ExerciseTypeRegistry; tests: TestRegistry };
  repositories: { sessions: SessionRepository; attempts: AttemptRepository };
};

type ThunkConfig = {
  extra: SessionPlayerDependencies;
  state: { sessionPlayer: SessionPlayerState };
};

export type OpenedSession = {
  session: DailySession;
  attempts: Attempt[];
  exerciseIds: string[];
  testTitle: LocalizedText | null;
  shownAt: string;
} | null;

/** Loads a session and its answers so the player resumes at the first unanswered exercise. */
export const openSession = createAsyncThunk<
  OpenedSession,
  { sessionId: string; catalog: ContentCatalog },
  ThunkConfig
>('sessionPlayer/open', async ({ sessionId, catalog }, { extra }) => {
  const session = await extra.repositories.sessions.getById(sessionId);
  if (!session) {
    return null;
  }
  const attempts = await extra.repositories.attempts.listBySession(sessionId);
  const testTitle = extra.registries.tests.get(session.testKind)?.title ?? null;
  const exerciseIds = availableExerciseIds(session, catalog);
  return { session, attempts, exerciseIds, testTitle, shownAt: extra.clock.now().toISOString() };
});

/**
 * Evaluates the draft answer of the current exercise, stores the attempt, advances the
 * session (started / completed with its score) and, for spaced-repetition tests, the FSRS card.
 */
export const submitAnswer = createAsyncThunk<
  { attempt: Attempt; session: DailySession },
  { exercise: Exercise },
  ThunkConfig
>('sessionPlayer/submit', async ({ exercise }, { extra, getState, dispatch }) => {
  const { session, attempts, exerciseIds, draft, shownAt } = getState().sessionPlayer;
  if (!session || !shownAt) {
    throw new Error('No open session');
  }
  const now = extra.clock.now();
  const built = buildAttempt({
    definition: extra.registries.exerciseTypes.require(exercise.type),
    exercise,
    draft,
    ids: { attemptId: extra.generateId(), sessionId: session.id },
    times: { shownAt, now },
  });
  if (!built) {
    throw new Error('The answer does not match the exercise type');
  }
  await extra.repositories.attempts.add(built.attempt);
  const next = progressSession({
    session,
    attempts: [...attempts, built.attempt],
    exerciseIds,
    now,
  });
  await extra.repositories.sessions.save(next);
  if (extra.registries.tests.get(session.testKind)?.spacedRepetition) {
    await dispatch(reviewExercise({ exerciseId: exercise.id, rating: built.rating })).unwrap();
  }
  return { attempt: built.attempt, session: next };
});

/** Moves to the next exercise and starts timing it. */
export const goToNext = createAsyncThunk<string, void, ThunkConfig>(
  'sessionPlayer/next',
  (_, { extra }) => extra.clock.now().toISOString(),
);
