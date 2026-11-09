import { screen } from '@testing-library/react-native';
import { lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { AppText } from '../AppText';
import { Card } from './Card';

describe('Card', () => {
  it('renders its children on the surface color', async () => {
    await renderWithTheme(
      <Card>
        <AppText>Test de logică</AppText>
      </Card>,
    );
    expect(screen.getByText('Test de logică')).toBeOnTheScreen();
    expect(screen.root).toHaveStyle({ backgroundColor: lightColors.surface });
  });
});
