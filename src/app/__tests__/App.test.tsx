import { fireEvent, render, screen } from '@testing-library/react-native';
import { App } from '../App';

describe('App', () => {
  it('starts on the Today tab, in Romanian', async () => {
    await render(<App />);
    expect(screen.getByRole('header', { name: 'Azi' })).toBeOnTheScreen();
  });

  it('switches tabs from the text-only tab bar', async () => {
    await render(<App />);
    // Tab items are role "tab" on Android and "button" on iOS (the Jest default platform).
    await fireEvent.press(screen.getByLabelText('Setări'));
    expect(screen.getByRole('header', { name: 'Setări' })).toBeOnTheScreen();
  });

  it('labels tabs in the UI language, without React Navigation English suffixes', async () => {
    await render(<App />);
    expect(screen.queryByLabelText(/tab, \d of \d/)).toBeNull();
  });
});
