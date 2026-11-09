import type { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { selectLanguage } from '@/features/settings';
import { LanguageProvider } from '@/shared/i18n';

/** Feeds the language chosen in settings into the i18n layer. */
export function StoreLanguageProvider({ children }: PropsWithChildren) {
  const language = useSelector(selectLanguage);
  return <LanguageProvider language={language}>{children}</LanguageProvider>;
}
