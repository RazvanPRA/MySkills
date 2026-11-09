import { selectLanguage } from '../state/selectors';
import { initialSettingsState, languageChanged, settingsReducer } from '../state/slice';

describe('settings slice', () => {
  it('starts in Romanian', () => {
    const state = settingsReducer(undefined, { type: '@@init' });
    expect(state).toEqual(initialSettingsState);
    expect(selectLanguage({ settings: state })).toBe('ro');
  });

  it('changes the language', () => {
    const state = settingsReducer(initialSettingsState, languageChanged('en'));
    expect(selectLanguage({ settings: state })).toBe('en');
  });
});
