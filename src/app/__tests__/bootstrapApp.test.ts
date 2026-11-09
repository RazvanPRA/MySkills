import { z } from 'zod';
import { selectLanguage, selectSettingsLoaded } from '@/features/settings';
import { bootstrapApp } from '../bootstrap/bootstrapApp';
import { createStore } from '../store';
import { SETTINGS_STORAGE_KEY } from '@/features/settings';
import { createTestDependencies } from '../testing/createTestDependencies';

const pack = {
  id: 'demo',
  version: '1.0.0',
  schemaVersion: 1,
  title: { ro: 'Demo' },
  categories: [{ id: 'react', title: { ro: 'React' }, testKinds: ['knowledge'], order: 1 }],
  topics: [
    {
      id: 'react.hooks',
      categoryId: 'react',
      title: { ro: 'Hooks' },
      level: 'mid',
      summary: { ro: 'x' },
    },
  ],
  exercises: [],
};

const noTypes = { get: () => undefined };

describe('bootstrapApp', () => {
  it('migrates storage, loads settings and builds the catalog', async () => {
    const { dependencies, sqlite } = await createTestDependencies({
      packs: [pack],
      storedSettings: { [SETTINGS_STORAGE_KEY]: JSON.stringify({ language: 'en' }) },
    });
    const store = createStore(dependencies);
    const content = await bootstrapApp({
      dependencies,
      dispatch: store.dispatch,
      exerciseTypes: noTypes,
    });

    expect(
      sqlite.prepare("select name from sqlite_master where name = 'attempts'").get(),
    ).toBeTruthy();
    expect(selectSettingsLoaded(store.getState())).toBe(true);
    expect(selectLanguage(store.getState())).toBe('en');
    expect(content.catalog.topicsById.has('react.hooks')).toBe(true);
    expect(content.issues).toEqual([]);
  });

  it('starts with invalid content excluded and reported, never failing', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const broken = { ...pack, exercises: [{ id: 'q1', type: 'nope' }] };
    const { dependencies } = await createTestDependencies({ packs: [broken, 'garbage'] });
    const store = createStore(dependencies);
    const types = { get: () => ({ payloadSchema: z.unknown() }) };
    const content = await bootstrapApp({
      dependencies,
      dispatch: store.dispatch,
      exerciseTypes: types,
    });

    expect(content.catalog.topicsById.size).toBe(1);
    expect(content.issues.map(i => i.code)).toEqual(['invalid_exercise', 'invalid_pack']);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('fails (for the error screen) when storage cannot be prepared', async () => {
    const { dependencies } = await createTestDependencies();
    const failing = {
      ...dependencies,
      storage: { prepare: () => Promise.reject(new Error('disk full')) },
    };
    const store = createStore(failing);
    await expect(
      bootstrapApp({ dependencies: failing, dispatch: store.dispatch, exerciseTypes: noTypes }),
    ).rejects.toThrow('disk full');
  });
});
