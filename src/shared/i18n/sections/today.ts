/** The Today screen: one card per daily test. */
export const todayRo = {
  title: 'Azi',
  status: {
    pending: 'Neînceput',
    inProgress: (answered: number, total: number) => `În lucru ${answered}/${total}`,
    completed: 'Gata',
  },
  approxMinutes: (minutes: string) => `~${minutes}`,
  start: 'Începe',
  continue: 'Continuă',
  score: (percent: number) => `Scor: ${percent}%`,
  noTopics:
    'Nu ai marcat încă niciun topic. Testul de cunoștințe folosește doar topicurile în lucru sau parcurse.',
  shortfall: (available: number, target: number) =>
    `Doar ${available} din ${target} întrebări disponibile azi. Marchează mai multe topicuri pentru un test complet.`,
  markTopics: 'Marchează topicuri',
  loading: 'Se pregătesc testele de azi…',
  error: 'Testele de azi nu au putut fi pregătite.',
  retry: 'Încearcă din nou',
};

export const todayEn: typeof todayRo = {
  title: 'Today',
  status: {
    pending: 'Not started',
    inProgress: (answered: number, total: number) => `In progress ${answered}/${total}`,
    completed: 'Done',
  },
  approxMinutes: (minutes: string) => `~${minutes}`,
  start: 'Start',
  continue: 'Continue',
  score: (percent: number) => `Score: ${percent}%`,
  noTopics:
    'You have not marked any topic yet. The knowledge test only uses topics in progress or studied.',
  shortfall: (available: number, target: number) =>
    `Only ${available} of ${target} questions available today. Mark more topics for a full test.`,
  markTopics: 'Mark topics',
  loading: "Preparing today's tests…",
  error: "Today's tests could not be prepared.",
  retry: 'Try again',
};
