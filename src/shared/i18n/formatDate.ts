import { parseLocalDate } from '@/shared/utils/localDate';
import type { Language } from './strings';

const LOCALES: Record<Language, string> = { ro: 'ro-RO', en: 'en-GB' };

/** "2026-11-10" → "Marți, 10 noiembrie" / "Tuesday, 10 November" (Hermes ships Intl). */
export function formatLongDate(day: string, language: Language): string {
  const text = parseLocalDate(day).toLocaleDateString(LOCALES[language], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return text.charAt(0).toLocaleUpperCase(LOCALES[language]) + text.slice(1);
}

/** "2026-11-09" → "9 nov." / "9 Nov" (lists, history). */
export const formatShortDate = (day: string, language: Language): string =>
  parseLocalDate(day).toLocaleDateString(LOCALES[language], { day: 'numeric', month: 'short' });
