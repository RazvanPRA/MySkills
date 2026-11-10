import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { SETTINGS_STORAGE_KEY } from '@/features/settings';
import { AppRoot } from '../AppRoot';
import { createMemoryReminders, createTestDependencies } from '../testing/createTestDependencies';
import { fixturePack } from './fixturePack';

const TIMEOUT = { timeout: 5000 };

async function firstRun() {
  const reminders = createMemoryReminders();
  const { dependencies, sqlite } = await createTestDependencies({
    packs: [fixturePack],
    reminders,
    storedSettings: { [SETTINGS_STORAGE_KEY]: JSON.stringify({ onboardingDone: false }) },
  });
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByText('Bun venit', undefined, TIMEOUT);
  return { sqlite, reminders, settings: () => dependencies.repositories.settings.load() };
}

const press = (name: string) => fireEvent.press(screen.getByRole('button', { name }));

describe('onboarding', () => {
  it('walks through track, self-assessment, review and reminder, then opens Today', async () => {
    const { sqlite, reminders, settings } = await firstRun();
    expect(screen.getByText('Pasul 1 din 4')).toBeOnTheScreen();
    expect(screen.getByText('Senior Full Stack')).toBeOnTheScreen();
    await press('Începe');

    expect(await screen.findByText('Unde ești acum?', undefined, TIMEOUT)).toBeOnTheScreen();
    const react = within(screen.getByLabelText('React + Next.js'));
    expect(react.getByRole('radio', { name: 'Nou' })).toBeSelected();
    await fireEvent.press(react.getByRole('radio', { name: 'Mid' }));
    await press('Continuă');

    // React has one Junior and one Mid topic in the fixture.
    expect(
      await screen.findByText('Se marchează 2 topicuri ca parcurse.', undefined, TIMEOUT),
    ).toBeOnTheScreen();
    await press('Continuă');

    await screen.findByText('Un memento pe zi', undefined, TIMEOUT);
    await fireEvent.press(
      within(screen.getByLabelText('Memento zilnic')).getByRole('radio', { name: 'Pornit' }),
    );
    await screen.findByLabelText('Ora mementoului: 20:00', undefined, TIMEOUT);
    await press('Gata');

    expect(await screen.findByRole('header', { name: 'Azi' }, TIMEOUT)).toBeOnTheScreen();
    expect(
      sqlite.prepare('select topic_id, status from topic_progress order by topic_id').all(),
    ).toEqual([
      { topic_id: 'react.hooks.mid', status: 'studied' },
      { topic_id: 'react.state.junior', status: 'studied' },
    ]);
    await waitFor(async () =>
      expect(await settings()).toMatchObject({
        onboardingDone: true,
        selfAssessment: { react: 'mid' },
        notificationTime: '20:00',
      }),
    );
    expect(reminders.calls.at(-1)?.scheduled?.[0]).toEqual({ hour: 20, minute: 0 });
  });

  it('goes back without losing choices, and can mark nothing', async () => {
    const { sqlite } = await firstRun();
    await press('Începe');
    await fireEvent.press(
      within(await screen.findByLabelText('Go', undefined, TIMEOUT)).getByRole('radio', {
        name: 'Junior',
      }),
    );
    await press('Continuă');
    await screen.findByText('Topicuri parcurse', undefined, TIMEOUT);
    await press('Înapoi');
    expect(
      within(await screen.findByLabelText('Go', undefined, TIMEOUT)).getByRole('radio', {
        name: 'Junior',
      }),
    ).toBeSelected();
    await fireEvent.press(within(screen.getByLabelText('Go')).getByRole('radio', { name: 'Nou' }));
    await press('Continuă');
    expect(
      await screen.findByText(
        'Nu se marchează niciun topic. Testul de cunoștințe pornește după ce marchezi topicuri în Studiu.',
        undefined,
        TIMEOUT,
      ),
    ).toBeOnTheScreen();
    await press('Continuă');
    await press('Gata');
    await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);
    expect(sqlite.prepare('select count(*) as n from topic_progress').get()).toEqual({ n: 0 });
  });
});
