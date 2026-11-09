import { createContext, type PropsWithChildren, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { type ColorScheme, type Theme, lightTheme, themeFor } from './theme';

const ThemeContext = createContext<Theme>(lightTheme);

type ThemeProviderProps = PropsWithChildren<{
  /** Forces a scheme (tests, future in-app setting). Defaults to the phone setting. */
  scheme?: ColorScheme;
}>;

export function ThemeProvider({ scheme, children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const resolved: ColorScheme = scheme ?? (systemScheme === 'dark' ? 'dark' : 'light');
  return <ThemeContext.Provider value={themeFor(resolved)}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): Theme => useContext(ThemeContext);
