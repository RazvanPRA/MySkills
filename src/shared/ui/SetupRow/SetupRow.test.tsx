import { screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { AppText } from '../AppText';
import { SetupRow } from './SetupRow';

describe('SetupRow', () => {
  it('shows the label, the control and the help text', async () => {
    await renderWithTheme(
      <SetupRow label="Limbă" help="Conținutul rămâne în română.">
        <AppText>control</AppText>
      </SetupRow>,
    );
    expect(screen.getByText('Limbă')).toBeOnTheScreen();
    expect(screen.getByText('control')).toBeOnTheScreen();
    expect(screen.getByText('Conținutul rămâne în română.')).toBeOnTheScreen();
  });

  it('works without help', async () => {
    await renderWithTheme(
      <SetupRow label="Cronometru">
        <AppText>control</AppText>
      </SetupRow>,
    );
    expect(screen.getByText('Cronometru')).toBeOnTheScreen();
  });
});
