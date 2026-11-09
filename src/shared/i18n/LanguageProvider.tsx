import { createContext, type PropsWithChildren, useContext } from 'react';
import { defaultLanguage, type Language, strings, type Strings } from './strings';

const LanguageContext = createContext<Language>(defaultLanguage);

type LanguageProviderProps = PropsWithChildren<{ language: Language }>;

/** The language value comes from the settings feature; this provider only distributes it. */
export function LanguageProvider({ language, children }: LanguageProviderProps) {
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

export const useLanguage = (): Language => useContext(LanguageContext);

/** UI strings in the current language. Containers translate, primitives receive plain text. */
export const useStrings = (): Strings => strings[useLanguage()];
