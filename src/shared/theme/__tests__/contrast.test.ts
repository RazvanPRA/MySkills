import { contrastRatio, relativeLuminance } from '../contrast';
import { type ColorTokens, darkColors, darkMastery, lightColors, lightMastery } from '../tokens';

const TEXT_MIN = 4.5;
const INDICATOR_MIN = 3;

type Pair = [foreground: keyof ColorTokens, background: keyof ColorTokens];

// Every text/background pair the design system uses (§2.1, §2.2, §5).
const textPairs: Pair[] = [
  ['text', 'background'],
  ['text', 'surface'],
  ['muted', 'background'],
  ['muted', 'surface'],
  ['accent', 'surface'],
  ['accent', 'background'],
  ['onAccent', 'accent'],
  ['text', 'accentSoft'],
  ['text', 'selected'],
  ['text', 'successSoft'],
  ['text', 'dangerSoft'],
  ['success', 'surface'],
  ['danger', 'surface'],
  ['codeText', 'codeSurface'],
  ['syntaxKeyword', 'codeSurface'],
  ['syntaxString', 'codeSurface'],
  ['syntaxNumber', 'codeSurface'],
  ['syntaxComment', 'codeSurface'],
  ['syntaxFunction', 'codeSurface'],
];

// Borders and filled indicators that carry state (selected, correct, wrong).
const indicatorPairs: Pair[] = [
  ['accent', 'accentSoft'],
  ['selectedBorder', 'selected'],
  ['success', 'successSoft'],
  ['danger', 'dangerSoft'],
];

describe.each([
  ['light', lightColors, lightMastery],
  ['dark', darkColors, darkMastery],
] as const)('%s palette', (_scheme, colors, mastery) => {
  it.each(textPairs)('%s on %s has text contrast >= 4.5:1', (fg, bg) => {
    expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  it.each(indicatorPairs)('%s on %s has indicator contrast >= 3:1', (fg, bg) => {
    expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(INDICATOR_MIN);
  });

  it.each([0, 1, 2, 3, 4])('mastery step %p text is readable on its fill', step => {
    const fill = mastery.fill[step] ?? '';
    const text = mastery.text[step] ?? '';
    expect(contrastRatio(text, fill)).toBeGreaterThanOrEqual(TEXT_MIN);
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white and symmetric', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });

  it('is 1 for identical colors', () => {
    expect(contrastRatio('#0B6E63', '#0B6E63')).toBe(1);
  });

  it('rejects colors that are not #RRGGBB', () => {
    expect(() => relativeLuminance('#fff')).toThrow('#RRGGBB');
    expect(() => relativeLuminance('red')).toThrow('#RRGGBB');
  });
});
