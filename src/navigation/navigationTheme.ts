import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import type { Theme } from '@/shared/theme';

/** React Navigation theme derived from design tokens (design system §3). */
export function toNavigationTheme({ scheme, color }: Theme): NavigationTheme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: scheme === 'dark',
    colors: {
      primary: color.accent,
      background: color.background,
      card: color.surface,
      text: color.text,
      border: color.border,
      notification: color.danger,
    },
  };
}
