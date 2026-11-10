import { pluralEn, pluralRo } from '../plural';

/** App shell: tabs, screen titles, startup, shared counts. */
export const coreRo = {
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
    problems: (n: number) =>
      pluralRo(n, { one: '{n} problemă', few: '{n} probleme', other: '{n} de probleme' }),
    minutes: (n: number) =>
      pluralRo(n, { one: '{n} minut', few: '{n} minute', other: '{n} de minute' }),
    days: (n: number) => pluralRo(n, { one: '{n} zi', few: '{n} zile', other: '{n} de zile' }),
    topics: (n: number) =>
      pluralRo(n, { one: '{n} topic', few: '{n} topicuri', other: '{n} de topicuri' }),
    mistakes: (n: number) =>
      pluralRo(n, { one: '{n} greșeală', few: '{n} greșeli', other: '{n} de greșeli' }),
    answers: (n: number) =>
      pluralRo(n, { one: '{n} răspuns', few: '{n} răspunsuri', other: '{n} de răspunsuri' }),
  },
};

export const coreEn: typeof coreRo = {
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
  bootstrap: {
    loadingTitle: 'Senior Prep',
    loadingBody: 'Preparing your data and content…',
    errorTitle: 'Startup failed',
    errorBody: (detail: string) => `Local data could not be prepared. Details: ${detail}`,
    retry: 'Try again',
  },
  counts: {
    questions: (n: number) => pluralEn(n, '{n} question', '{n} questions'),
    problems: (n: number) => pluralEn(n, '{n} problem', '{n} problems'),
    minutes: (n: number) => pluralEn(n, '{n} minute', '{n} minutes'),
    days: (n: number) => pluralEn(n, '{n} day', '{n} days'),
    topics: (n: number) => pluralEn(n, '{n} topic', '{n} topics'),
    mistakes: (n: number) => pluralEn(n, '{n} mistake', '{n} mistakes'),
    answers: (n: number) => pluralEn(n, '{n} answer', '{n} answers'),
  },
};
