/** Progress: Today's stat tiles and suggestion, and the Progress tab. */
export const progressRo = {
  screen: {
    loading: 'Se calculează progresul…',
    error: 'Progresul nu a putut fi încărcat.',
    retry: 'Încearcă din nou',
  },
  matrix: {
    title: 'Matricea de competențe',
    help: 'Procentul este stăpânirea medie a topicurilor care au exerciții. „—” înseamnă că nu ai exersat încă.',
    category: 'Categorie',
    estimated: 'Nivel estimat',
    belowJunior: 'Sub Junior',
    empty: '—',
    cellLabel: (category: string, level: string, value: string) =>
      `${category}, ${level}: ${value}`,
    notStarted: 'neînceput',
    noExercises: 'fără exerciții',
    estimatedLabel: (category: string, level: string) => `${category}, nivel estimat: ${level}`,
    selfAssessed: (level: string) => `Autoevaluare: ${level}`,
  },
  logic: {
    title: 'Acuratețe la logică',
    week: (date: string) => `Săptămâna din ${date}`,
    noAnswers: 'Fără răspunsuri',
  },
  weak: {
    title: 'Puncte slabe',
    empty: 'Niciun topic exersat nu e sub 60%.',
    mastery: (value: number) => `Stăpânire ${value}%`,
  },
  history: {
    title: 'Istoric',
    empty: 'Niciun test terminat încă.',
  },
  stats: {
    streak: 'Serie',
    todayDone: 'Testele de azi sunt gata.',
    todayPending: 'Termină testele de azi ca să o continui.',
    frozen: 'O zi ratată a fost acoperită de înghețarea săptămânii.',
    accuracy: 'Acuratețe 7 zile',
    noAnswers: 'Niciun răspuns în ultimele 7 zile.',
    noValue: '—',
    percent: (value: number) => `${value}%`,
  },
  suggestion: {
    title: 'Sugestie de studiu',
    weak: (mastery: number) => `De recitit · stăpânire ${mastery}%`,
    next: 'Următorul topic',
  },
};

export const progressEn: typeof progressRo = {
  screen: {
    loading: 'Calculating your progress…',
    error: 'Your progress could not be loaded.',
    retry: 'Try again',
  },
  matrix: {
    title: 'Competency matrix',
    help: 'The percentage is the average mastery of topics that have exercises. "—" means nothing practised yet.',
    category: 'Category',
    estimated: 'Estimated level',
    belowJunior: 'Below Junior',
    empty: '—',
    cellLabel: (category: string, level: string, value: string) =>
      `${category}, ${level}: ${value}`,
    notStarted: 'not started',
    noExercises: 'no exercises',
    estimatedLabel: (category: string, level: string) => `${category}, estimated level: ${level}`,
    selfAssessed: (level: string) => `Self-assessed: ${level}`,
  },
  logic: {
    title: 'Logic accuracy',
    week: (date: string) => `Week of ${date}`,
    noAnswers: 'No answers',
  },
  weak: {
    title: 'Weak spots',
    empty: 'No practised topic is below 60%.',
    mastery: (value: number) => `Mastery ${value}%`,
  },
  history: {
    title: 'History',
    empty: 'No finished test yet.',
  },
  stats: {
    streak: 'Streak',
    todayDone: "Today's tests are done.",
    todayPending: "Finish today's tests to keep it going.",
    frozen: "A missed day was covered by this week's freeze.",
    accuracy: '7-day accuracy',
    noAnswers: 'No answers in the last 7 days.',
    noValue: '—',
    percent: (value: number) => `${value}%`,
  },
  suggestion: {
    title: 'Suggested topic',
    weak: (mastery: number) => `Re-read · mastery ${mastery}%`,
    next: 'Next topic',
  },
};
