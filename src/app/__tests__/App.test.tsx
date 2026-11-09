import { fireEvent, render, screen } from '@testing-library/react-native';
import { SETTINGS_STORAGE_KEY } from '@/features/settings';
import { createTestDependencies } from '../testing/createTestDependencies';
import { AppRoot } from '../AppRoot';

async function renderApp(options?: Parameters<typeof createTestDependencies>[0]) {
  const { dependencies } = await createTestDependencies(options);
  await render(<AppRoot dependencies={dependencies} />);
  // The bootstrap gate (migrations, settings, content) resolves asynchronously.
  return screen.findByRole('header', { name: /Azi|Today/ });
}

describe('App', () => {
  it('boots and starts on the Today tab, in Romanian', async () => {
    expect(await renderApp()).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Azi' })).toBeOnTheScreen();
  });

  it('uses the stored language', async () => {
    await renderApp({
      storedSettings: { [SETTINGS_STORAGE_KEY]: JSON.stringify({ language: 'en' }) },
    });
    expect(screen.getByRole('header', { name: 'Today' })).toBeOnTheScreen();
  });

  it('switches tabs from the text-only tab bar', async () => {
    await renderApp();
    // Tab items are role "tab" on Android and "button" on iOS (the Jest default platform).
    await fireEvent.press(screen.getByLabelText('Setări'));
    expect(screen.getByRole('header', { name: 'Setări' })).toBeOnTheScreen();
  });

  it('labels tabs in the UI language, without React Navigation English suffixes', async () => {
    await renderApp();
    expect(screen.queryByLabelText(/tab, \d of \d/)).toBeNull();
  });
});
