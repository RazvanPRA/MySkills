import { screen } from '@testing-library/react-native';
import { darkMastery, lightMastery } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { MasteryCell } from './MasteryCell';

describe('MasteryCell', () => {
  it('shows the percentage on the fill of its step, labelled for screen readers', async () => {
    await renderWithTheme(
      <MasteryCell percent={72} text="72%" accessibilityLabel="React, Senior: 72%" />,
    );
    expect(screen.getByLabelText('React, Senior: 72%')).toHaveStyle({
      backgroundColor: lightMastery.fill[3],
    });
    expect(screen.getByText('72%')).toHaveStyle({ color: lightMastery.text[3] });
  });

  it('uses the "not started" step when nothing was practised', async () => {
    await renderWithTheme(
      <MasteryCell percent={null} text="—" accessibilityLabel="Go, Mid: neînceput" />,
      'dark',
    );
    expect(screen.getByLabelText('Go, Mid: neînceput')).toHaveStyle({
      backgroundColor: darkMastery.fill[0],
    });
  });
});
