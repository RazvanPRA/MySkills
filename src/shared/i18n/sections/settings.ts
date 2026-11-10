/** The Settings tab. */
export const settingsRo = {
  preferences: 'Preferințe',
  language: 'Limba aplicației',
  languageHelp: 'Conținutul care există doar în română rămâne în română.',
  languageNames: { ro: 'Română', en: 'English' },
  knowledgeLength: 'Întrebări în testul de cunoștințe',
  logicLength: 'Probleme în testul de logică',
  lengthHelp: 'Testul de azi se schimbă doar dacă nu l-ai început.',
  timer: 'Cronometru',
  timerHelp: 'Arată timpul petrecut la fiecare exercițiu.',
  on: 'Pornit',
  off: 'Oprit',
  content: 'Pachete de conținut',
  packMeta: (version: string) => `Versiunea ${version}`,
};

export const settingsEn: typeof settingsRo = {
  preferences: 'Preferences',
  language: 'App language',
  languageHelp: 'Content that exists only in Romanian stays in Romanian.',
  languageNames: { ro: 'Română', en: 'English' },
  knowledgeLength: 'Questions in the knowledge test',
  logicLength: 'Problems in the logic test',
  lengthHelp: "Today's test only changes if you have not started it.",
  timer: 'Timer',
  timerHelp: 'Shows the time spent on each exercise.',
  on: 'On',
  off: 'Off',
  content: 'Content packs',
  packMeta: (version: string) => `Version ${version}`,
};
