import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ContentCatalog } from '@/features/content';
import type { SettingsState } from '@/features/settings';
import { hashString } from '@/shared/utils/seededRandom';
import type { DailySession, TestScope } from '../model/dailySession';
import { readBuildInputs } from './buildInputs';
import type { DailyTestsDependencies } from './dependencies';

type ThunkConfig = { extra: DailyTestsDependencies; state: { settings: SettingsState } };

export type StartOnDemandInput = { catalog: ContentCatalog; testKind: string; scope: TestScope };

/**
 * Starts an on-demand session (brief §9.6), or resumes the unfinished one with the same scope
 * from today. Resolves to the session id, or null when the scope has nothing to practise.
 * Each new session gets a fresh seed, so practising again gives a different order.
 */
export const startOnDemandSession = createAsyncThunk<
  string | null,
  StartOnDemandInput,
  ThunkConfig
>('dailyTests/startOnDemand', async ({ catalog, testKind, scope }, { extra, getState }) => {
  const definition = extra.registries.tests.get(testKind);
  if (!definition || definition.schedule !== 'on_demand') {
    throw new Error(`"${testKind}" is not an on-demand test`);
  }
  const inputs = await readBuildInputs(extra, getState(), catalog);
  const { sessions } = extra.repositories;
  const open = await sessions.findOpenByScope({ date: inputs.date, testKind, scope });
  if (open) {
    return open.id;
  }
  const now = extra.clock.now().toISOString();
  const seed = hashString(`${testKind}:${JSON.stringify(scope)}:${now}`);
  const plan = definition.buildSession({ ...inputs, seed, scope });
  if (plan.exerciseIds.length === 0) {
    return null;
  }
  const session: DailySession = {
    id: extra.generateId(),
    date: inputs.date,
    testKind,
    exerciseIds: plan.exerciseIds,
    status: 'pending',
    scope,
  };
  await sessions.save(session);
  return session.id;
});
