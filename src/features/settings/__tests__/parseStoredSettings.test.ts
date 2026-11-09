import { defaultUserSettings } from '../model/userSettings';
import { parseStoredSettings } from '../services/parseStoredSettings.service';

describe('parseStoredSettings', () => {
  it('returns defaults on first run', () => {
    expect(parseStoredSettings(null)).toEqual(defaultUserSettings);
  });

  it('reads a valid document', () => {
    const stored = { ...defaultUserSettings, language: 'en', notificationTime: '07:30' };
    expect(parseStoredSettings(JSON.stringify(stored))).toEqual(stored);
  });

  it('fills fields added in newer app versions with defaults', () => {
    expect(parseStoredSettings(JSON.stringify({ language: 'en' }))).toEqual({
      ...defaultUserSettings,
      language: 'en',
    });
  });

  it('keeps valid fields when another field is corrupted', () => {
    const stored = { language: 'en', knowledgeTestLength: 7, notificationTime: '25:99' };
    expect(parseStoredSettings(JSON.stringify(stored))).toEqual({
      ...defaultUserSettings,
      language: 'en',
    });
  });

  it.each(['not json', '[1,2]', '"text"', '42'])('falls back to defaults for %p', json => {
    expect(parseStoredSettings(json)).toEqual(defaultUserSettings);
  });
});
