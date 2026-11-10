import { pluralEn, pluralRo } from '../plural';

/** Exercise renderers, the session player and the results screen. */
export const sessionRo = {
  exercise: {
    chooseCount: (n: number) =>
      pluralRo(n, {
        one: 'Alege un răspuns',
        few: 'Alege {n} răspunsuri',
        other: 'Alege {n} de răspunsuri',
      }),
    flashcardHint: 'Formulează răspunsul în minte, apoi compară-l cu răspunsul model.',
    modelAnswer: 'Răspuns model',
    keyPoints: 'Puncte cheie',
    rateLabel: 'Cât de bine ai știut?',
    ratings: { 1: 'Nu știam', 2: 'Greu', 3: 'Bine', 4: 'Ușor' },
  },
  player: {
    check: 'Verifică',
    next: 'Următoarea',
    finish: 'Termină',
    showAnswer: 'Arată răspunsul',
    back: 'Înapoi',
    position: (current: number, total: number) => `${current} / ${total}`,
    progress: 'Progres în test',
    correct: 'Corect',
    wrong: 'Greșit',
    partial: (earned: number, total: number) => `Parțial corect (${earned}/${total})`,
    explanation: 'Explicație',
    rereadTopic: 'Recitește topicul',
    onlyRomanian: 'Conținut disponibil doar în română.',
    loading: 'Se încarcă testul…',
    notFound: 'Testul nu mai există.',
    unavailable: 'Exercițiul nu mai este disponibil și a fost sărit.',
    saveError: 'Răspunsul nu a putut fi salvat. Încearcă din nou.',
  },
  results: {
    label: 'Rezultat',
    correctOf: (correct: number, total: number) => `${correct} din ${total} corecte`,
    verdicts: {
      strong: 'Foarte bine! Stăpânești subiectele de azi.',
      fair: 'Bine, dar recitește topicurile de mai jos.',
      weak: 'Ai lacune aici. Începe cu topicurile de mai jos.',
    },
    toReview: 'De recitit',
    nothingToReview: 'Nimic de recitit azi.',
    done: 'Gata',
  },
};

export const sessionEn: typeof sessionRo = {
  exercise: {
    chooseCount: (n: number) => pluralEn(n, 'Choose one answer', 'Choose {n} answers'),
    flashcardHint: 'Form your answer in your head, then compare it with the model answer.',
    modelAnswer: 'Model answer',
    keyPoints: 'Key points',
    rateLabel: 'How well did you know it?',
    ratings: { 1: "Didn't know", 2: 'Hard', 3: 'Good', 4: 'Easy' },
  },
  player: {
    check: 'Check',
    next: 'Next',
    finish: 'Finish',
    showAnswer: 'Show answer',
    back: 'Back',
    position: (current: number, total: number) => `${current} / ${total}`,
    progress: 'Test progress',
    correct: 'Correct',
    wrong: 'Wrong',
    partial: (earned: number, total: number) => `Partially correct (${earned}/${total})`,
    explanation: 'Explanation',
    rereadTopic: 'Re-read the topic',
    onlyRomanian: 'Content available in Romanian only.',
    loading: 'Loading the test…',
    notFound: 'This test no longer exists.',
    unavailable: 'This exercise is no longer available and was skipped.',
    saveError: 'Your answer could not be saved. Try again.',
  },
  results: {
    label: 'Result',
    correctOf: (correct: number, total: number) => `${correct} of ${total} correct`,
    verdicts: {
      strong: 'Very good! You know today’s subjects.',
      fair: 'Good, but re-read the topics below.',
      weak: 'There are gaps here. Start with the topics below.',
    },
    toReview: 'To re-read',
    nothingToReview: 'Nothing to re-read today.',
    done: 'Done',
  },
};
