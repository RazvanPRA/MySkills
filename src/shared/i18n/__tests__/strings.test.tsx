import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { hasCedillaDiacritics } from '../diacritics';
import { LanguageProvider, useStrings } from '../LanguageProvider';
import { strings } from '../strings';

/** Every leaf of a strings tree; functions are called with sample counts. */
function collectTexts(node: unknown): string[] {
  if (typeof node === 'string') {
    return [node];
  }
  if (typeof node === 'function') {
    return [0, 1, 2, 20].map(n => String((node as (n: number) => unknown)(n)));
  }
  if (node && typeof node === 'object') {
    return Object.values(node).flatMap(collectTexts);
  }
  return [];
}

describe('strings', () => {
  it('has no empty string in either language', () => {
    for (const texts of [collectTexts(strings.ro), collectTexts(strings.en)]) {
      expect(texts.length).toBeGreaterThan(0);
      expect(texts.filter(t => t.trim() === '')).toEqual([]);
    }
  });

  it('uses comma-below ș/ț, never cedilla ş/ţ', () => {
    expect(collectTexts(strings.ro).filter(hasCedillaDiacritics)).toEqual([]);
  });

  it('formats Romanian counts with the right plural', () => {
    expect(strings.ro.counts.questions(10)).toBe('10 întrebări');
    expect(strings.ro.counts.days(21)).toBe('21 de zile');
  });
});

describe('hasCedillaDiacritics', () => {
  it('detects cedilla forms and accepts comma-below forms', () => {
    expect(hasCedillaDiacritics('Setări şi ţintă')).toBe(true);
    expect(hasCedillaDiacritics('Setări și țintă')).toBe(false);
  });
});

describe('useStrings', () => {
  it('returns the strings for the provided language', async () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <LanguageProvider language="en">{children}</LanguageProvider>
    );
    const { result } = await renderHook(() => useStrings(), { wrapper });
    expect(result.current.tabs.settings).toBe('Settings');
  });

  it('defaults to Romanian without a provider', async () => {
    const { result } = await renderHook(() => useStrings());
    expect(result.current.tabs.settings).toBe('Setări');
  });
});
