import { buildContentCatalog, type ContentCatalog } from '@/features/content';
import type { TestBuildContext } from '@/features/daily-tests';
import type { Attempt } from '@/features/session-player';
import { defaultUserSettings } from '@/features/settings';
import type { ReviewCard } from '@/features/spaced-repetition';
import type { TopicProgress } from '@/features/study-map';

/**
 * Four knowledge categories (react, go, sql, nestjs) and one logic category.
 * Each knowledge category: t1 (mid), t2 (mid), t3 (senior); 4 exercises per topic.
 * Senior exercises have difficulty 4 (stretch candidates), the others difficulty 2.
 */
export const KNOWLEDGE_CATEGORIES = ['react', 'go', 'sql', 'nestjs'] as const;
const TOPICS = [
  ['t1', 'mid'],
  ['t2', 'mid'],
  ['t3', 'senior'],
] as const;

const text = (ro: string) => ({ ro });

function fixturePack() {
  const categories = [...KNOWLEDGE_CATEGORIES, 'logic'].map((id, order) => ({
    id,
    title: text(id),
    testKinds: [id === 'logic' ? 'logic' : 'knowledge'],
    order,
  }));
  const topics = [...KNOWLEDGE_CATEGORIES, 'logic'].flatMap(categoryId =>
    TOPICS.map(([name, level]) => ({
      id: `${categoryId}.${name}.${level}`,
      categoryId,
      title: text(name),
      level,
      summary: text('x'),
    })),
  );
  const exercises = topics.flatMap(topic =>
    [1, 2, 3, 4].map(n => ({
      id: `${topic.id}.q${n}`,
      type: 'any',
      topicId: topic.id,
      level: topic.level,
      difficulty: topic.level === 'senior' ? 4 : 2,
      estimatedSeconds: 60,
      prompt: text('?'),
      payload: {},
      explanation: text('.'),
    })),
  );
  return {
    id: 'fixture',
    version: '1.0.0',
    schemaVersion: 1,
    title: text('F'),
    categories,
    topics,
    exercises,
  };
}

const anyType = {
  get: () => ({
    payloadSchema: { safeParse: (data: unknown) => ({ success: true as const, data }) },
  }),
};

export const catalog: ContentCatalog = buildContentCatalog(
  [fixturePack()],
  anyType as never,
).catalog;

export const ALL_KNOWLEDGE_TOPICS = KNOWLEDGE_CATEGORIES.flatMap(category =>
  TOPICS.map(([name, level]) => `${category}.${name}.${level}`),
);

export const covered = (topicIds: readonly string[]): TopicProgress[] =>
  topicIds.map(topicId => ({ topicId, status: 'studied', updatedAt: '2026-11-01T08:00:00.000Z' }));

export const card = (exerciseId: string, due: string): ReviewCard => ({
  exerciseId,
  due,
  stability: 3,
  difficulty: 5,
  scheduledDays: 3,
  learningSteps: 0,
  reps: 2,
  lapses: 0,
  state: 'review',
  lastReview: '2026-11-01T08:00:00.000Z',
});

export const attempt = (exerciseId: string, score: number): Attempt => ({
  id: `a-${exerciseId}-${score}`,
  sessionId: 's',
  exerciseId,
  answer: null,
  result: { correct: score === 1, score },
  durationMs: 1000,
  answeredAt: '2026-11-09T08:00:00.000Z',
});

export const buildContext = (overrides: Partial<TestBuildContext> = {}): TestBuildContext => ({
  date: '2026-11-10',
  seed: 1,
  catalog,
  progress: covered(ALL_KNOWLEDGE_TOPICS),
  reviewCards: [],
  recentAttempts: [],
  settings: defaultUserSettings,
  ...overrides,
});

export const categoryOf = (exerciseId: string) => exerciseId.split('.')[0] ?? '';
export const topicOf = (exerciseId: string) => exerciseId.split('.').slice(0, 3).join('.');
