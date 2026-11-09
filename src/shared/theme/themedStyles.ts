import type { Theme } from './theme';
import { useTheme } from './ThemeProvider';

export type StyleFactory<T> = (theme: Theme) => T;

// One built style object per (factory, theme) pair, shared by every instance of a component.
const cache = new WeakMap<StyleFactory<unknown>, WeakMap<Theme, unknown>>();

/** Pure, cached: builds the styles of `factory` for `theme` once. */
export function getThemedStyles<T>(factory: StyleFactory<T>, theme: Theme): T {
  let byTheme = cache.get(factory);
  if (!byTheme) {
    byTheme = new WeakMap();
    cache.set(factory, byTheme);
  }
  if (!byTheme.has(theme)) {
    byTheme.set(theme, factory(theme));
  }
  return byTheme.get(theme) as T;
}

/** `createStyles` must be a module-level function so the cache can hit. */
export function useThemedStyles<T>(factory: StyleFactory<T>): T {
  return getThemedStyles(factory, useTheme());
}
