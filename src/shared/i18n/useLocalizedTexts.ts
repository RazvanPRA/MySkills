import { useMemo } from 'react';
import { type LocalizedText, resolveText } from '@/shared/domain';
import { useLanguage } from './LanguageProvider';

/** Content texts (options, steps) in the UI language, falling back to Romanian. Memoized. */
export function useLocalizedTexts(texts: readonly LocalizedText[]): string[] {
  const language = useLanguage();
  return useMemo(() => texts.map(text => resolveText(text, language).text), [texts, language]);
}
