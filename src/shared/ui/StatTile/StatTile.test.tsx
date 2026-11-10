import { screen } from '@testing-library/react-native';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { StatTile } from './StatTile';

describe('StatTile', () => {
  it('shows label, value and caption, read as one element', async () => {
    await renderWithTheme(
      <StatTile label="Serie" value="12 zile" caption="Testele de azi sunt gata." />,
    );
    expect(screen.getByText('12 zile')).toBeOnTheScreen();
    expect(screen.getByLabelText('Serie: 12 zile. Testele de azi sunt gata.')).toBeOnTheScreen();
  });

  it('works without a caption', async () => {
    await renderWithTheme(<StatTile label="Acuratețe" value="—" />);
    expect(screen.getByLabelText('Acuratețe: —')).toBeOnTheScreen();
    expect(screen.queryByText('Testele de azi sunt gata.')).toBeNull();
  });
});
