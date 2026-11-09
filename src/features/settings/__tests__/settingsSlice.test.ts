import { configureStore } from '@reduxjs/toolkit';
import { defaultUserSettings } from '../model/userSettings';
import {
  createLocalSettingsRepository,
  createMemoryKeyValueStore,
  SETTINGS_STORAGE_KEY,
} from '../repository/LocalSettingsRepository';
import { selectLanguage, selectSettings, selectSettingsLoaded } from '../state/selectors';
import { initialSettingsState, settingsReducer } from '../state/slice';
import { loadSettings, updateSettings } from '../state/thunks';

function setup(stored?: object) {
  const store = createMemoryKeyValueStore(
    stored ? { [SETTINGS_STORAGE_KEY]: JSON.stringify(stored) } : {},
  );
  const repository = createLocalSettingsRepository(store);
  const redux = configureStore({
    reducer: { settings: settingsReducer },
    middleware: m => m({ thunk: { extraArgument: { repositories: { settings: repository } } } }),
  });
  return { redux, store };
}

describe('settings slice', () => {
  it('starts with defaults (Romanian), not yet loaded', () => {
    const state = { settings: settingsReducer(undefined, { type: '@@init' }) };
    expect(state.settings).toEqual(initialSettingsState);
    expect(selectLanguage(state)).toBe('ro');
    expect(selectSettingsLoaded(state)).toBe(false);
  });

  it('loads stored settings', async () => {
    const { redux } = setup({ language: 'en', knowledgeTestLength: 15 });
    await redux.dispatch(loadSettings());
    expect(selectSettings(redux.getState())).toMatchObject({
      language: 'en',
      knowledgeTestLength: 15,
    });
    expect(selectSettingsLoaded(redux.getState())).toBe(true);
  });

  it('updates and persists a change', async () => {
    const { redux, store } = setup();
    await redux.dispatch(loadSettings());
    await redux.dispatch(updateSettings({ language: 'en' }));
    expect(selectLanguage(redux.getState())).toBe('en');
    const persisted = JSON.parse((await store.getItem(SETTINGS_STORAGE_KEY)) ?? '{}');
    expect(persisted).toEqual({ ...defaultUserSettings, language: 'en' });
  });

  it('applies the change optimistically, before saving finishes', async () => {
    const { redux } = setup();
    const saving = redux.dispatch(updateSettings({ timerEnabled: true }));
    expect(selectSettings(redux.getState()).timerEnabled).toBe(true);
    await saving;
  });
});
