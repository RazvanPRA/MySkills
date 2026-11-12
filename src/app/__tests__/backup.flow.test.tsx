import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createBackup } from '@/features/backup';
import { defaultUserSettings, SETTINGS_STORAGE_KEY } from '@/features/settings';
import { AppRoot } from '../AppRoot';
import { createMemoryFiles, createTestDependencies } from '../testing/createTestDependencies';
import { fixturePack } from './fixturePack';

const TIMEOUT = { timeout: 5000 };

/** A copy made on Nov 9: one studied topic, one finished test with one answer. */
const copy = createBackup({
  exportedAt: '2026-11-09T18:00:00.000Z',
  settings: { ...defaultUserSettings, onboardingDone: true, knowledgeTestLength: 5 },
  snapshot: {
    topicProgress: [
      { topicId: 'react.hooks.mid', status: 'studied', updatedAt: '2026-11-09T18:00:00.000Z' },
    ],
    reviewCards: [],
    sessions: [
      {
        id: 'old',
        date: '2026-11-09',
        testKind: 'knowledge',
        exerciseIds: ['react.hooks.mid.q1'],
        status: 'completed',
        score: 1,
      },
    ],
    attempts: [
      {
        id: 'a1',
        sessionId: 'old',
        exerciseId: 'react.hooks.mid.q1',
        answer: { index: 0 },
        result: { correct: true, score: 1 },
        durationMs: 5000,
        answeredAt: '2026-11-09T17:59:00.000Z',
      },
    ],
  },
});

async function openSettings(opened: (string | null)[] = []) {
  const memory = createMemoryFiles(opened);
  const { dependencies, sqlite } = await createTestDependencies({
    packs: [fixturePack],
    files: memory.files,
    storedSettings: { [SETTINGS_STORAGE_KEY]: JSON.stringify({ onboardingDone: true }) },
  });
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);
  await fireEvent.press(screen.getByLabelText('Setări'));
  await screen.findByText('Datele tale', undefined, TIMEOUT);
  return { memory, sqlite, settings: () => dependencies.repositories.settings.load() };
}

const press = async (name: string) => fireEvent.press(screen.getByRole('button', { name }));

describe('your data', () => {
  it('exports every table and the settings to a dated JSON file', async () => {
    const { memory } = await openSettings();
    await press('Exportă datele');
    expect(
      await screen.findByText('Datele au fost salvate.', undefined, TIMEOUT),
    ).toBeOnTheScreen();
    expect(memory.saved).toHaveLength(1);
    const [file] = memory.saved;
    expect(file?.fileName).toBe('senior-prep-2026-11-10.json');
    expect(JSON.parse(file?.text ?? '')).toMatchObject({
      format: 'senior-prep-backup',
      version: 1,
      settings: { onboardingDone: true },
      // Today's knowledge test was generated on the first open.
      sessions: [],
    });
  });

  it('rejects a file that is not a backup, without touching data', async () => {
    await openSettings(['{"hello":"world"}']);
    await press('Importă date');
    expect(
      await screen.findByText('Fișierul ales nu este o copie Senior Prep.', undefined, TIMEOUT),
    ).toBeOnTheScreen();
  });

  it('imports after confirmation, then reloads the app with the new data', async () => {
    const { sqlite, settings } = await openSettings([copy]);
    await press('Importă date');
    expect(
      await screen.findByText(
        'Înlocuiești datele de pe acest telefon cu copia din 9 nov. (1 topic, 1 test, 1 răspuns)?',
        undefined,
        TIMEOUT,
      ),
    ).toBeOnTheScreen();
    await press('Înlocuiește');

    // The app restarted on Today, with the imported topic feeding the knowledge test.
    expect(await screen.findByRole('header', { name: 'Azi' }, TIMEOUT)).toBeOnTheScreen();
    expect(sqlite.prepare('select topic_id, status from topic_progress').all()).toEqual([
      { topic_id: 'react.hooks.mid', status: 'studied' },
    ]);
    expect(sqlite.prepare('select id from attempts').all()).toEqual([{ id: 'a1' }]);
    await waitFor(async () => expect((await settings()).knowledgeTestLength).toBe(5));
  });

  it('cancelling keeps everything as it was', async () => {
    const { sqlite } = await openSettings([copy]);
    await press('Importă date');
    await screen.findByText('Anulează', undefined, TIMEOUT);
    await press('Anulează');
    expect(screen.getByRole('button', { name: 'Exportă datele' })).toBeOnTheScreen();
    expect(sqlite.prepare('select count(*) as n from topic_progress').get()).toEqual({ n: 0 });
  });

  it('deletes all data and settings after confirmation', async () => {
    const { sqlite, settings } = await openSettings([copy]);
    await press('Importă date');
    await screen.findByText('Înlocuiește', undefined, TIMEOUT);
    await press('Înlocuiește');
    await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);

    await fireEvent.press(screen.getByLabelText('Setări'));
    await screen.findByText('Șterge toate datele', undefined, TIMEOUT);
    await press('Șterge toate datele');
    expect(
      screen.getByText(
        'Ștergi progresul, notițele, testele și setările de pe acest telefon? Nu se poate anula.',
      ),
    ).toBeOnTheScreen();
    await press('Șterge tot');
    await waitFor(() =>
      expect(sqlite.prepare('select count(*) as n from attempts').get()).toEqual({ n: 0 }),
    );
    expect(sqlite.prepare('select count(*) as n from topic_progress').get()).toEqual({ n: 0 });
    await waitFor(async () => expect(await settings()).toEqual(defaultUserSettings));
  });
});
