import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { darkTheme, lightTheme, type Theme } from '../theme';
import { ThemeProvider } from '../ThemeProvider';
import { getThemedStyles, useThemedStyles } from '../themedStyles';

const factory = jest.fn((theme: Theme) => ({ box: { backgroundColor: theme.color.surface } }));

describe('getThemedStyles', () => {
  beforeEach(() => factory.mockClear());

  it('builds the styles once per theme and reuses them', () => {
    const first = getThemedStyles(factory, lightTheme);
    const second = getThemedStyles(factory, lightTheme);
    expect(second).toBe(first);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('builds separate styles for light and dark', () => {
    const light = getThemedStyles(factory, lightTheme);
    const dark = getThemedStyles(factory, darkTheme);
    expect(light.box.backgroundColor).toBe(lightTheme.color.surface);
    expect(dark.box.backgroundColor).toBe(darkTheme.color.surface);
  });
});

describe('useThemedStyles', () => {
  const wrapper =
    (scheme: 'light' | 'dark') =>
    ({ children }: PropsWithChildren) =>
      <ThemeProvider scheme={scheme}>{children}</ThemeProvider>;

  it('uses the theme from the provider', async () => {
    const { result } = await renderHook(() => useThemedStyles(factory), {
      wrapper: wrapper('dark'),
    });
    expect(result.current.box.backgroundColor).toBe(darkTheme.color.surface);
  });
});
