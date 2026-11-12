import { buildContentCatalog, type ContentCatalog } from '@/features/content';
import type { TopicProgress } from '@/features/study-map';
import type { AttemptFact } from '../model/facts';

const text = (ro: string) => ({ ro });

/** [topic id, category, level, exercise count, prerequisites] */
const TOPICS = [
  ['react.a.junior', 'react', 'junior', 2, []],
  ['react.b.junior', 'react', 'junior', 1, []],
  ['react.c.mid', 'react', 'mid', 1, ['react.a.junior']],
  ['react.e.mid', 'react', 'mid', 0, []],
  ['react.d.senior', 'react', 'senior', 1, ['react.c.mid']],
  ['logic.x.junior', 'logic', 'junior', 1, []],
] as const;

const pack = {
  id: 'progress-fixture',
  version: '1.0.0',
  schemaVersion: 1,
  title: text('P'),
  categories: [
    { id: 'react', title: text('React'), testKinds: ['knowledge'], order: 0 },
    { id: 'logic', title: text('Logică'), testKinds: ['logic'], order: 1 },
  ],
  topics: TOPICS.map(([id, categoryId, level, , prerequisites]) => ({
    id,
    categoryId,
    level,
    prerequisites: [...prerequisites],
    title: text(id),
    summary: text('x'),
  })),
  exercises: TOPICS.flatMap(([topicId, , level, count]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${topicId}.q${index + 1}`,
      type: 'any',
      topicId,
      level,
      difficulty: 3,
      estimatedSeconds: 60,
      prompt: text('?'),
      payload: {},
      explanation: text('.'),
    })),
  ),
};

const anyType = {
  get: () => ({
    payloadSchema: { safeParse: (data: unknown) => ({ success: true as const, data }) },
  }),
};

export const catalog: ContentCatalog = buildContentCatalog([pack], anyType as never).catalog;

export const NOW = '2026-11-10T12:00:00.000Z';

/** An attempt `daysAgo` days before NOW. */
export const fact = (exerciseId: string, { score = 1, daysAgo = 0 } = {}): AttemptFact => ({
  exerciseId,
  sessionId: 's',
  score,
  answeredAt: new Date(Date.parse(NOW) - daysAgo * 86_400_000).toISOString(),
});

export const covered = (...topicIds: string[]): Record<string, TopicProgress> =>
  Object.fromEntries(
    topicIds.map(topicId => [
      topicId,
      { topicId, status: 'studied', updatedAt: '2026-11-01T00:00:00.000Z' },
    ]),
  );
