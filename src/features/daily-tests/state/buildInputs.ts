import type { ContentCatalog } from '@/features/content';
import { selectSettings, type SettingsState } from '@/features/settings';
import { addDays, parseLocalDate, toLocalDate } from '@/shared/utils/localDate';
import type { TestBuildContext } from '../model/testDefinition';
import type { DailyTestsDependencies } from './dependencies';

/**
 * Attempts of the last 30 days feed every test: the logic test needs them for its 30-day
 * no-repeat rule (brief §7.2); each test narrows the window further.
 */
const ATTEMPT_HISTORY_DAYS = 30;

export type BuildInputs = Omit<TestBuildContext, 'seed' | 'scope'>;

/** Reads everything a test needs to build a session for the device's local day. */
export async function readBuildInputs(
  extra: DailyTestsDependencies,
  state: { settings: SettingsState },
  catalog: ContentCatalog,
): Promise<BuildInputs> {
  const date = toLocalDate(extra.clock.now());
  const since = parseLocalDate(addDays(date, -ATTEMPT_HISTORY_DAYS)).toISOString();
  const { topicProgress, reviewCards, attempts } = extra.repositories;
  const [progress, cards, recentAttempts] = await Promise.all([
    topicProgress.getAll(),
    reviewCards.getAll(),
    attempts.listSince(since),
  ]);
  return {
    date,
    catalog,
    progress,
    reviewCards: cards,
    recentAttempts,
    settings: selectSettings(state),
  };
}
