import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ContentCatalog } from '@/features/content';
import type { AttemptRepository } from '@/features/session-player';
import { selectSettings, type SettingsState } from '@/features/settings';
import type { ReviewCardRepository } from '@/features/spaced-repetition';
import type { TopicProgressRepository } from '@/features/study-map';
import type { Clock } from '@/shared/utils/clock';
import type { IdGenerator } from '@/shared/utils/idGenerator';
import { addDays, parseLocalDate, toLocalDate } from '@/shared/utils/localDate';
import type { TestBuildContext, TestDefinition } from '../model/testDefinition';
import type { SessionRepository } from '../repository/SessionRepository';
import { reconcileDailySession } from '../services/reconcileDailySession.service';
import { sessionSeed } from '../services/sessionHelpers';
import { type TestRegistry, testsWithSchedule } from '../services/testRegistry';
import type { TodayCardState } from './slice';

/**
 * Attempts of the last 30 days feed today's tests: the logic test needs them for its 30-day
 * no-repeat rule (brief §7.2); each test narrows the window further.
 */
const ATTEMPT_HISTORY_DAYS = 30;

/** What this feature needs from the dependency container. */
export type DailyTestsDependencies = {
  clock: Clock;
  generateId: IdGenerator;
  registries: { tests: TestRegistry };
  repositories: {
    sessions: SessionRepository;
    attempts: AttemptRepository;
    topicProgress: TopicProgressRepository;
    reviewCards: ReviewCardRepository;
  };
};

type ThunkConfig = { extra: DailyTestsDependencies; state: { settings: SettingsState } };
type BuildInputs = Omit<TestBuildContext, 'seed' | 'scope'>;

async function prepareCard(
  definition: TestDefinition,
  inputs: BuildInputs,
  extra: DailyTestsDependencies,
): Promise<TodayCardState> {
  const { sessions, attempts } = extra.repositories;
  const plan = definition.buildSession({
    ...inputs,
    seed: sessionSeed(inputs.date, definition.kind),
  });
  const existing = await sessions.findByDateAndKind(inputs.date, definition.kind);
  const { session, changed } = reconcileDailySession({
    existing,
    plan,
    date: inputs.date,
    testKind: definition.kind,
    newId: extra.generateId,
  });
  if (session && changed) {
    await sessions.save(session);
  }
  const answered = session ? (await attempts.listBySession(session.id)).length : 0;
  return {
    kind: definition.kind,
    title: definition.title,
    session,
    shortfall: plan.shortfall ?? null,
    answered,
  };
}

/**
 * Today's cards (brief §6.2, §7.3): for every daily test, builds today's session on the first
 * open of the day and stores it; later opens reuse it. The day is the device's local day.
 */
export const loadToday = createAsyncThunk<
  { date: string; cards: TodayCardState[] },
  { catalog: ContentCatalog },
  ThunkConfig
>('dailyTests/loadToday', async ({ catalog }, { extra, getState }) => {
  const date = toLocalDate(extra.clock.now());
  const since = parseLocalDate(addDays(date, -ATTEMPT_HISTORY_DAYS)).toISOString();
  const { topicProgress, reviewCards, attempts } = extra.repositories;
  const [progress, cards, recentAttempts] = await Promise.all([
    topicProgress.getAll(),
    reviewCards.getAll(),
    attempts.listSince(since),
  ]);
  const inputs: BuildInputs = {
    date,
    catalog,
    progress,
    reviewCards: cards,
    recentAttempts,
    settings: selectSettings(getState()),
  };
  const definitions = testsWithSchedule(extra.registries.tests, 'daily');
  const today: TodayCardState[] = [];
  for (const definition of definitions) {
    today.push(await prepareCard(definition, inputs, extra));
  }
  return { date, cards: today };
});
