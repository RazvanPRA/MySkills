/** Progress: Today's stat tiles and suggestion, and the Progress tab. */
export const progressRo = {
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
