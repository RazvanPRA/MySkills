import { buildContentCatalog, type ContentCatalog } from '@/features/content';
import type { TestBuildContext } from '@/features/daily-tests';
import type { Attempt } from '@/features/session-player';
import { defaultUserSettings } from '@/features/settings';

export const SUBCATEGORIES = ['trace', 'event-loop', 'complexity', 'sql', 'puzzles'] as const;

/** Difficulties of the 3 exercises of each topic, by level. */
const DIFFICULTIES = { junior: [1, 2, 2], mid: [3, 3, 3], senior: [4, 4, 5] } as const;
const LEVELS = Object.keys(DIFFICULTIES) as (keyof typeof DIFFICULTIES)[];

const text = (ro: string) => ({ ro });

type PackOptions = {
  subcategories?: readonly string[];
  levels?: readonly (keyof typeof DIFFICULTIES)[];
};

/**
 * A logic category (topics logic.<subcategory>.<level>, 3 exercises each) and one knowledge
 * category that must never reach the logic pool.
 */
function fixturePack({ subcategories = SUBCATEGORIES, levels = LEVELS }: PackOptions) {
  const logicTopics = subcategories.flatMap(name =>
    levels.map(level => ({ id: `logic.${name}.${level}`, categoryId: 'logic', level })),
  );
  const topics = [...logicTopics, { id: 'react.hooks.mid', categoryId: 'react', level: 'mid' }].map(
    topic => ({ ...topic, title: text(topic.id), summary: text('x') }),
  );
  const exercises = topics.flatMap(topic =>
    DIFFICULTIES[topic.level as keyof typeof DIFFICULTIES].map((difficulty, index) => ({
      id: `${topic.id}.q${index + 1}`,
      type: 'any',
      topicId: topic.id,
      level: topic.level,
      difficulty,
      estimatedSeconds: 180,
      prompt: text('?'),
      payload: {},
      explanation: text('.'),
    })),
  );
  return {
    id: 'logic-fixture',
    version: '1.0.0',
    schemaVersion: 1,
    title: text('F'),
    categories: [
      { id: 'logic', title: text('Logică'), testKinds: ['logic'], order: 1 },
      { id: 'react', title: text('React'), testKinds: ['knowledge'], order: 0 },
    ],
    topics,
    exercises,
  };
}

const anyType = {
  get: () => ({
    payloadSchema: { safeParse: (data: unknown) => ({ success: true as const, data }) },
  }),
};

export const logicCatalog = (options: PackOptions = {}): ContentCatalog =>
  buildContentCatalog([fixturePack(options)], anyType as never).catalog;

export const catalog = logicCatalog();

/** Logic exercise ids of the default catalog. */
export const LOGIC_IDS = [...catalog.exercisesById.keys()].filter(id => id.startsWith('logic.'));

export const difficultyOf = (id: string) => catalog.exercisesById.get(id)?.difficulty ?? 0;
export const subcategoryOfId = (id: string) => id.split('.').slice(0, 2).join('.');

/** An attempt answered `daysAgo` local days before 2026-11-10, at 09:00. */
export const attempt = (exerciseId: string, { score = 1, daysAgo = 1 } = {}): Attempt => ({
  id: `a-${exerciseId}-${daysAgo}-${score}`,
  sessionId: 's',
  exerciseId,
  answer: null,
  result: { correct: score === 1, score },
  durationMs: 1000,
  answeredAt: new Date(2026, 10, 10 - daysAgo, 9).toISOString(),
});

export const buildContext = (overrides: Partial<TestBuildContext> = {}): TestBuildContext => ({
  date: '2026-11-10',
  seed: 7,
  catalog,
  progress: [],
  reviewCards: [],
  recentAttempts: [],
  settings: defaultUserSettings,
  ...overrides,
});

export const mean = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
