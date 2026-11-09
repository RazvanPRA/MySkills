import { Platform } from 'react-native';

/**
 * Design tokens: the single source of truth for every visual value
 * (senior-prep-design-system §2). Never hard-code colors, sizes or spacing elsewhere.
 */

export type ColorTokens = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  selected: string;
  selectedBorder: string;
  // Code colors: only inside CodeBlock.
  codeSurface: string;
  codeText: string;
  syntaxKeyword: string;
  syntaxString: string;
  syntaxNumber: string;
  syntaxComment: string;
  syntaxFunction: string;
};

type FiveSteps = readonly [string, string, string, string, string];

/** Mastery scale, steps 0..4: only inside MasteryCell. */
export type MasteryTokens = { fill: FiveSteps; text: FiveSteps };

export const lightColors: ColorTokens = {
  background: '#F2F5F6',
  surface: '#FFFFFF',
  text: '#14202B',
  muted: '#56636E',
  border: '#D6DDE1',
  accent: '#0B6E63',
  onAccent: '#FFFFFF',
  accentSoft: '#E0F0ED',
  success: '#1E6E36',
  successSoft: '#E3F2E8',
  danger: '#A8231B',
  dangerSoft: '#FBE8E6',
  selected: '#DCE9F2',
  selectedBorder: '#3A6F96',
  codeSurface: '#EBF0F2',
  codeText: '#14202B',
  syntaxKeyword: '#6F3C96',
  syntaxString: '#8A4B08',
  syntaxNumber: '#0F5F8C',
  syntaxComment: '#56636E',
  syntaxFunction: '#9C2A5E',
};

export const darkColors: ColorTokens = {
  background: '#0E1418',
  surface: '#162027',
  text: '#E4EBEE',
  muted: '#97A5AE',
  border: '#2A3740',
  accent: '#43C2AF',
  onAccent: '#04201B',
  accentSoft: '#12332E',
  success: '#6CCB8A',
  successSoft: '#123020',
  danger: '#F2918A',
  dangerSoft: '#3A1815',
  selected: '#1C3242',
  selectedBorder: '#7FB2D6',
  codeSurface: '#0A1014',
  codeText: '#E4EBEE',
  syntaxKeyword: '#C9A2F0',
  syntaxString: '#E7B37A',
  syntaxNumber: '#8CC4F0',
  syntaxComment: '#97A5AE',
  syntaxFunction: '#F0A3C4',
};

export const lightMastery: MasteryTokens = {
  fill: ['#FFFFFF', '#E0F0ED', '#B5DDD5', '#5FAE9F', '#0B6E63'],
  text: ['#14202B', '#14202B', '#14202B', '#04201B', '#FFFFFF'],
};

export const darkMastery: MasteryTokens = {
  fill: ['#162027', '#12332E', '#1D5249', '#2B786A', '#43C2AF'],
  text: ['#E4EBEE', '#E4EBEE', '#E4EBEE', '#FFFFFF', '#04201B'],
};

/** 4 pt spacing scale. */
export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 10, pill: 999 } as const;

/** Minimum size of every pressable element, in points. */
export const touchTarget = 44;

export const fontFamily = {
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
} as const;

const lineHeight = (size: number, ratio: number): number => Math.round(size * ratio);

export const typography = {
  display: { fontSize: 40, fontWeight: '700', lineHeight: lineHeight(40, 1.1) },
  title: { fontSize: 19, fontWeight: '600', lineHeight: lineHeight(19, 1.4) },
  body: { fontSize: 16, fontWeight: '400', lineHeight: lineHeight(16, 1.45) },
  small: { fontSize: 14, fontWeight: '400', lineHeight: lineHeight(14, 1.45) },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: lineHeight(12, 1.4) },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  code: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: lineHeight(14, 1.5),
    fontFamily: fontFamily.mono,
  },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Weight used for emphasis (`bold`): never a different font or italic. */
export const boldWeight = '600';

/** Opacity of pressed and disabled interactive elements (§5). */
export const opacity = { pressed: 0.8, disabled: 0.45 } as const;
