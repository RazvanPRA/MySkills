/** Levels, topic statuses, study map and topic detail. */
export const studyRo = {
  levels: { junior: 'Junior', mid: 'Mid', senior: 'Senior' },
  topicStatus: { not_started: 'Neînceput', in_progress: 'În lucru', studied: 'Parcurs' },
  studyMap: {
    title: 'Studiu',
    subtitle: 'Marchează ce ai parcurs. Testul de cunoștințe folosește doar aceste topicuri.',
    categories: 'Categorii',
    empty: 'Categoria nu are încă topicuri.',
    loadError: 'Progresul nu a putut fi încărcat.',
  },
  topic: {
    summary: 'Ce trebuie să știi',
    resources: 'Resurse',
    status: 'Status',
    prerequisites: 'Înainte de acesta',
    notFound: 'Topicul nu mai există în conținut.',
    back: 'Înapoi',
    openLink: (title: string) => `Deschide ${title}`,
  },
};

export const studyEn: typeof studyRo = {
  levels: { junior: 'Junior', mid: 'Mid', senior: 'Senior' },
  topicStatus: { not_started: 'Not started', in_progress: 'In progress', studied: 'Studied' },
  studyMap: {
    title: 'Study',
    subtitle: 'Mark what you have studied. The knowledge test only uses these topics.',
    categories: 'Categories',
    empty: 'This category has no topics yet.',
    loadError: 'Your progress could not be loaded.',
  },
  topic: {
    summary: 'What you should know',
    resources: 'Resources',
    status: 'Status',
    prerequisites: 'Before this one',
    notFound: 'This topic no longer exists in the content.',
    back: 'Back',
    openLink: (title: string) => `Open ${title}`,
  },
};
