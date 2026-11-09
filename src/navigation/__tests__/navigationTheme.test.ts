import { darkTheme, lightTheme } from '@/shared/theme';
import { toNavigationTheme } from '../navigationTheme';
import { tabScreenOptions } from '../TabNavigator';

describe('toNavigationTheme', () => {
  it.each([lightTheme, darkTheme])('maps tokens for the $scheme scheme', theme => {
    const nav = toNavigationTheme(theme);
    expect(nav.dark).toBe(theme.scheme === 'dark');
    expect(nav.colors).toEqual({
      primary: theme.color.accent,
      background: theme.color.background,
      card: theme.color.surface,
      text: theme.color.text,
      border: theme.color.border,
      notification: theme.color.danger,
    });
  });
});

describe('tabScreenOptions', () => {
  it('hides icons and uses accent / muted tints', () => {
    const options = tabScreenOptions(lightTheme);
    expect(options.tabBarIconStyle).toEqual({ display: 'none' });
    expect(options.tabBarActiveTintColor).toBe(lightTheme.color.accent);
    expect(options.tabBarInactiveTintColor).toBe(lightTheme.color.muted);
  });
});
