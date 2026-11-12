/** First run (brief §9.1): track, self-assessment, marked topics, reminder. */
export const onboardingRo = {
  step: (current: number, total: number) => `Pasul ${current} din ${total}`,
  welcome: {
    title: 'Bun venit',
    body: 'În fiecare zi primești un test de logică și unul de cunoștințe. Testul de cunoștințe folosește doar topicurile pe care le-ai parcurs.',
    track: 'Traseu',
    trackName: 'Senior Full Stack',
    trackHelp: 'Frontend, mobile, backend, baze de date, DevOps și soft skills.',
  },
  assess: {
    title: 'Unde ești acum?',
    body: 'Pentru fiecare arie, alege nivelul la care te simți acasă. Topicurile până la acel nivel se marchează ca parcurse.',
    none: 'Nou',
  },
  review: {
    title: 'Topicuri parcurse',
    body: (topics: string) => `Se marchează ${topics} ca parcurse.`,
    nothing:
      'Nu se marchează niciun topic. Testul de cunoștințe pornește după ce marchezi topicuri în Studiu.',
    help: 'Le poți schimba oricând din Studiu.',
  },
  reminder: { title: 'Un memento pe zi' },
  start: 'Începe',
  next: 'Continuă',
  back: 'Înapoi',
  finish: 'Gata',
};

export const onboardingEn: typeof onboardingRo = {
  step: (current: number, total: number) => `Step ${current} of ${total}`,
  welcome: {
    title: 'Welcome',
    body: 'Every day you get a logic test and a knowledge test. The knowledge test only uses topics you have studied.',
    track: 'Track',
    trackName: 'Senior Full Stack',
    trackHelp: 'Frontend, mobile, backend, databases, DevOps and soft skills.',
  },
  assess: {
    title: 'Where are you now?',
    body: 'For each area, pick the level you are at home with. Topics up to that level are marked as studied.',
    none: 'New',
  },
  review: {
    title: 'Studied topics',
    body: (topics: string) => `${topics} will be marked as studied.`,
    nothing: 'No topic will be marked. The knowledge test starts once you mark topics in Study.',
    help: 'You can change them any time in Study.',
  },
  reminder: { title: 'One reminder a day' },
  start: 'Start',
  next: 'Continue',
  back: 'Back',
  finish: 'Done',
};
