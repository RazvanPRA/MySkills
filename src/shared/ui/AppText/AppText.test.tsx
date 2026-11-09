import { screen } from '@testing-library/react-native';
import { darkColors, lightColors, typography } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { AppText } from './AppText';

describe('AppText', () => {
  it('renders body text in the default tone', async () => {
    await renderWithTheme(<AppText>Salut</AppText>);
    expect(screen.getByText('Salut')).toHaveStyle({
      fontSize: typography.body.fontSize,
      color: lightColors.text,
    });
  });

  it('applies variant, tone and bold', async () => {
    await renderWithTheme(
      <AppText variant="title" tone="accent" bold>
        Titlu
      </AppText>,
    );
    expect(screen.getByText('Titlu')).toHaveStyle({
      fontSize: typography.title.fontSize,
      color: lightColors.accent,
      fontWeight: '600',
    });
  });

  it('uses dark colors in the dark scheme', async () => {
    await renderWithTheme(<AppText tone="muted">Notă</AppText>, 'dark');
    expect(screen.getByText('Notă')).toHaveStyle({ color: darkColors.muted });
  });

  it('passes accessibility props through', async () => {
    await renderWithTheme(<AppText accessibilityRole="header">Azi</AppText>);
    expect(screen.getByRole('header', { name: 'Azi' })).toBeOnTheScreen();
  });
});
