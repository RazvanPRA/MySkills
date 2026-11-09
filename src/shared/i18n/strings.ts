import { pluralEn, pluralRo } from './plural';

/**
 * Every user-visible UI string, in Romanian (default) and English.
 * `en` is typed as `Strings`, so a key missing in either language fails compilation.
 * Romanian uses comma-below ș/ț (never cedilla ş/ţ); a test enforces it.
 */
const ro = {
  tabs: {
    today: 'Azi',
    study: 'Studiu',
    progress: 'Progres',
    settings: 'Setări',
  },
  screens: {
    today: { title: 'Azi', subtitle: 'Testele de azi apar aici.' },
    study: { title: 'Studiu', subtitle: 'Harta categoriilor și a topicurilor.' },
    progress: { title: 'Progres', subtitle: 'Nivelul tău pe fiecare arie.' },
    settings: { title: 'Setări', subtitle: 'Limbă, notificări și date.' },
  },
  placeholder: {
    availableInPhase: (phase: number) => `Disponibil în faza ${phase}.`,
  },
  bootstrap: {
    loadingTitle: 'Senior Prep',
    loadingBody: 'Se pregătesc datele și conținutul…',
    errorTitle: 'Pornire eșuată',
    errorBody: (detail: string) => `Datele locale nu au putut fi pregătite. Detalii: ${detail}`,
    retry: 'Încearcă din nou',
  },
  counts: {
    questions: (n: number) =>
      pluralRo(n, { one: '{n} întrebare', few: '{n} întrebări', other: '{n} de întrebări' }),
    minutes: (n: number) =>
      pluralRo(n, { one: '{n} minut', few: '{n} minute', other: '{n} de minute' }),
    days: (n: number) => pluralRo(n, { one: '{n} zi', few: '{n} zile', other: '{n} de zile' }),
  },
};

export type Strings = typeof ro;

const en: Strings = {
  tabs: {
    today: 'Today',
    study: 'Study',
    progress: 'Progress',
    settings: 'Settings',
  },
  screens: {
    today: { title: 'Today', subtitle: "Today's tests show up here." },
    study: { title: 'Study', subtitle: 'The map of categories and topics.' },
    progress: { title: 'Progress', subtitle: 'Your level in every area.' },
    settings: { title: 'Settings', subtitle: 'Language, notifications and data.' },
  },
  placeholder: {
    availableInPhase: (phase: number) => `Available in phase ${phase}.`,
  },
  bootstrap: {
    loadingTitle: 'Senior Prep',
    loadingBody: 'Preparing your data and content…',
    errorTitle: 'Startup failed',
    errorBody: (detail: string) => `Local data could not be prepared. Details: ${detail}`,
    retry: 'Try again',
  },
  counts: {
    questions: (n: number) => pluralEn(n, '{n} question', '{n} questions'),
    minutes: (n: number) => pluralEn(n, '{n} minute', '{n} minutes'),
    days: (n: number) => pluralEn(n, '{n} day', '{n} days'),
  },
};

export const languages = ['ro', 'en'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = 'ro';

export const strings: Record<Language, Strings> = { ro, en };
