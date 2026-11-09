import {
  type ColorTokens,
  type MasteryTokens,
  darkColors,
  darkMastery,
  lightColors,
  lightMastery,
  opacity,
  radius,
  space,
  touchTarget,
  typography,
} from './tokens';

export type ColorScheme = 'light' | 'dark';

export type Theme = {
  scheme: ColorScheme;
  color: ColorTokens;
  mastery: MasteryTokens;
  space: typeof space;
  radius: typeof radius;
  typography: typeof typography;
  opacity: typeof opacity;
  touchTarget: number;
};

const shared = { space, radius, typography, opacity, touchTarget };

export const lightTheme: Theme = {
  scheme: 'light',
  color: lightColors,
  mastery: lightMastery,
  ...shared,
};

export const darkTheme: Theme = {
  scheme: 'dark',
  color: darkColors,
  mastery: darkMastery,
  ...shared,
};

export const themeFor = (scheme: ColorScheme): Theme =>
  scheme === 'dark' ? darkTheme : lightTheme;
