import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { AppRoot } from '../AppRoot';
import { createTestDependencies } from '../testing/createTestDependencies';
import { logicFixturePack } from './logicFixturePack';

const TIMEOUT = { timeout: 5000 };

async function openSettings() {
  const { dependencies } = await createTestDependencies({ packs: [logicFixturePack] });
  await render(<AppRoot dependencies={dependencies} />);
  await screen.findByRole('header', { name: 'Azi' }, TIMEOUT);
  await fireEvent.press(screen.getByLabelText('Setări'));
  await screen.findByText('Preferințe', undefined, TIMEOUT);
  return { settings: () => dependencies.repositories.settings.load() };
}

describe('Settings', () => {
  it('switches the app language at once and saves it', async () => {
    const { settings } = await openSettings();
    await fireEvent.press(screen.getByRole('radio', { name: 'English' }));
    expect(await screen.findByText('Preferences', undefined, TIMEOUT)).toBeOnTheScreen();
    expect(screen.getByLabelText('Settings')).toBeOnTheScreen();
    await waitFor(async () => expect((await settings()).language).toBe('en'));
  });

  it('saves test lengths and the timer', async () => {
    const { settings } = await openSettings();
    // 15 is only offered for the knowledge test (logic: 3 / 5 / 8).
    await fireEvent.press(screen.getByRole('radio', { name: '15' }));
    await fireEvent.press(
      within(screen.getByLabelText('Cronometru')).getByRole('radio', { name: 'Pornit' }),
    );
    await waitFor(async () =>
      expect(await settings()).toMatchObject({ knowledgeTestLength: 15, timerEnabled: true }),
    );
  });

  it('shows the timer in a session only when it is on', async () => {
    await openSettings();
    await fireEvent.press(
      within(screen.getByLabelText('Cronometru')).getByRole('radio', { name: 'Pornit' }),
    );
    await fireEvent.press(screen.getByLabelText('Azi'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Începe' }, TIMEOUT));
    expect(
      await screen.findByLabelText(/^Timp la acest exercițiu: \d+:\d{2}$/, undefined, TIMEOUT),
    ).toBeOnTheScreen();
  });

  it('lists installed content packs with their version', async () => {
    await openSettings();
    expect(screen.getByText('Logică')).toBeOnTheScreen();
    expect(screen.getByText('Versiunea 1.0.0')).toBeOnTheScreen();
  });
});
