import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { type ColorScheme, ThemeProvider } from '@/shared/theme';

/** Test helper: renders `ui` inside the theme provider (light by default). */
export function renderWithTheme(ui: ReactElement, scheme: ColorScheme = 'light') {
  return render(<ThemeProvider scheme={scheme}>{ui}</ThemeProvider>);
}
