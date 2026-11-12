import type { UserDataSnapshot } from '../model/backup';

/** A small snapshot touching every table; `tag` makes two of them distinct. */
export const snapshot = (tag = 'a'): UserDataSnapshot => ({
  topicProgress: [
    {
      topicId: `react.${tag}`,
      status: 'studied',
      studiedAt: '2026-11-01T08:00:00.000Z',
      notes: 'Notiță',
      updatedAt: '2026-11-01T08:00:00.000Z',
    },
  ],
  reviewCards: [
    {
      exerciseId: `react.${tag}.q1`,
      due: '2026-11-12T08:00:00.000Z',
      stability: 3.2,
      difficulty: 5.1,
      scheduledDays: 2,
      learningSteps: 0,
      reps: 2,
      lapses: 0,
      state: 'review',
      lastReview: '2026-11-10T08:00:00.000Z',
    },
  ],
  sessions: [
    // In read order: by date, then id.
    {
      id: `p-${tag}`,
      date: '2026-11-10',
      testKind: 'practice',
      exerciseIds: [`react.${tag}.q1`],
      status: 'pending',
      scope: { topicIds: [`react.${tag}`] },
    },
    {
      id: `s-${tag}`,
      date: '2026-11-10',
      testKind: 'knowledge',
      exerciseIds: [`react.${tag}.q1`],
      status: 'completed',
      startedAt: '2026-11-10T08:00:00.000Z',
      completedAt: '2026-11-10T08:05:00.000Z',
      score: 1,
    },
  ],
  attempts: [
    {
      id: `a-${tag}`,
      sessionId: `s-${tag}`,
      exerciseId: `react.${tag}.q1`,
      answer: { index: 1 },
      result: { correct: true, score: 1 },
      durationMs: 12000,
      confidence: 3,
      answeredAt: '2026-11-10T08:01:00.000Z',
    },
  ],
});
