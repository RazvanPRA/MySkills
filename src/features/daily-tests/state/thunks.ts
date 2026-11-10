import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ContentCatalog } from '@/features/content';
import type { SettingsState } from '@/features/settings';
import type { TestDefinition } from '../model/testDefinition';
import { reconcileDailySession } from '../services/reconcileDailySession.service';
import { sessionSeed } from '../services/sessionHelpers';
import { testsWithSchedule } from '../services/testRegistry';
import { type BuildInputs, readBuildInputs } from './buildInputs';
import type { DailyTestsDependencies } from './dependencies';
import type { TodayCardState } from './slice';

export type { DailyTestsDependencies };

type ThunkConfig = { extra: DailyTestsDependencies; state: { settings: SettingsState } };

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
    itemKind: definition.itemKind ?? 'question',
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
  const inputs = await readBuildInputs(extra, getState(), catalog);
  const definitions = testsWithSchedule(extra.registries.tests, 'daily');
  const today: TodayCardState[] = [];
  for (const definition of definitions) {
    today.push(await prepareCard(definition, inputs, extra));
  }
  return { date: inputs.date, cards: today };
});
