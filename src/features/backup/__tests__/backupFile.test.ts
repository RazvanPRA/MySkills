import { defaultUserSettings } from '@/features/settings';
import { backupFileName, createBackup, parseBackup } from '../services/backupFile.service';
import { snapshot } from './fixtures';

const text = createBackup({
  snapshot: snapshot(),
  settings: { ...defaultUserSettings, onboardingDone: true },
  exportedAt: '2026-11-10T09:00:00.000Z',
});

const edited = (change: (data: Record<string, unknown>) => void) => {
  const data = JSON.parse(text) as Record<string, unknown>;
  change(data);
  return JSON.stringify(data);
};

describe('backup file', () => {
  it('names the file after the local day', () => {
    expect(backupFileName('2026-11-10')).toBe('senior-prep-2026-11-10.json');
  });

  it('round-trips data and settings', () => {
    const parsed = parseBackup(text);
    expect(parsed).toMatchObject({ ok: true });
    if (parsed.ok) {
      expect(parsed.backup).toMatchObject({
        format: 'senior-prep-backup',
        version: 1,
        ...snapshot(),
      });
      expect(parsed.backup.settings.onboardingDone).toBe(true);
    }
  });

  it('fills settings added after the export with defaults', () => {
    const parsed = parseBackup(edited(data => (data.settings = { language: 'en' })));
    expect(parsed.ok && parsed.backup.settings).toEqual({ ...defaultUserSettings, language: 'en' });
  });

  it.each([
    ['not JSON', 'not json at all', 'not_json'],
    ['another JSON file', JSON.stringify({ hello: 'world' }), 'not_backup'],
    ['null', 'null', 'not_backup'],
    ['a newer app version', edited(data => (data.version = 2)), 'newer_version'],
    ['a damaged row', edited(data => (data.topicProgress = [{ topicId: 1 }])), 'invalid'],
    ['an attempt without its session', edited(data => (data.sessions = [])), 'invalid'],
  ])('rejects %s', (_case, input, problem) => {
    expect(parseBackup(input)).toEqual({ ok: false, problem });
  });
});
