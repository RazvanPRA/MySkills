import { buildContentCatalog } from '@/features/content';
import type { TestBuildContext } from '@/features/daily-tests';
import type { Attempt } from '@/features/session-player';
import { defaultUserSettings } from '@/features/settings';
import { practiceTest } from '../index';
import { buildPracticeSession } from '../services/buildPracticeSession.service';

const text = (ro: string) => ({ ro });

/** react.hooks.mid has 12 exercises (difficulty cycles 1–5); logic.trace.junior has 2. */
const pack = {
  id: 'practice-fixture',
  version: '1.0.0',
  schemaVersion: 1,
  title: text('P'),
  categories: [
    { id: 'react', title: text('React'), testKinds: ['knowledge'], order: 0 },
    { id: 'logic', title: text('Logică'), testKinds: ['logic'], order: 1 },
  ],
  topics: [
    { id: 'react.hooks.mid', categoryId: 'react', level: 'mid' },
    { id: 'logic.trace.junior', categoryId: 'logic', level: 'junior' },
  ].map(topic => ({ ...topic, title: text(topic.id), summary: text('x') })),
  exercises: [
    ...Array.from({ length: 12 }, (_, i) => ['react.hooks.mid', i, (i % 5) + 1] as const),
    ['logic.trace.junior', 0, 2] as const,
    ['logic.trace.junior', 1, 1] as const,
  ].map(([topicId, index, difficulty]) => ({
    id: `${topicId}.q${String(index + 1).padStart(2, '0')}`,
    type: 'any',
    topicId,
    level: topicId.endsWith('mid') ? 'mid' : 'junior',
    difficulty,
    estimatedSeconds: 60,
    prompt: text('?'),
    payload: {},
    explanation: text('.'),
  })),
};

const anyType = {
  get: () => ({
    payloadSchema: { safeParse: (data: unknown) => ({ success: true as const, data }) },
  }),
};
const { catalog } = buildContentCatalog([pack], anyType as never);

const answered = (exerciseId: string, answeredAt: string): Attempt => ({
  id: `${exerciseId}-${answeredAt}`,
  sessionId: 's',
  exerciseId,
  answer: null,
  result: { correct: true, score: 1 },
  durationMs: 1000,
  answeredAt,
});

const context = (overrides: Partial<TestBuildContext> = {}): TestBuildContext => ({
  date: '2026-11-10',
  seed: 42,
  catalog,
  progress: [],
  reviewCards: [],
  recentAttempts: [],
  settings: defaultUserSettings,
  scope: { topicIds: ['react.hooks.mid'] },
  ...overrides,
});

const difficultyOf = (id: string) => catalog.exercisesById.get(id)?.difficulty ?? 0;

describe('practice test definition', () => {
  it('is an on-demand test that does not update FSRS reviews', () => {
    expect(practiceTest).toMatchObject({
      kind: 'practice',
      schedule: 'on_demand',
      spacedRepetition: false,
    });
  });

  it('serves up to 10 exercises of the scoped topic, easiest first', () => {
    const { exerciseIds } = buildPracticeSession(context());
    expect(exerciseIds).toHaveLength(10);
    expect(new Set(exerciseIds).size).toBe(10);
    expect(exerciseIds.every(id => id.startsWith('react.hooks.mid.'))).toBe(true);
    const difficulties = exerciseIds.map(difficultyOf);
    expect(difficulties).toEqual([...difficulties].sort((a, b) => a - b));
  });

  it('works for any category and status (a logic topic, never marked)', () => {
    const plan = buildPracticeSession(context({ scope: { topicIds: ['logic.trace.junior'] } }));
    expect(plan.exerciseIds).toEqual(['logic.trace.junior.q02', 'logic.trace.junior.q01']);
  });

  it('prefers exercises not answered recently, then the least recently answered', () => {
    const all = catalog.exercisesByTopic.get('react.hooks.mid')?.map(e => e.id) ?? [];
    // Everything answered except q12; q01 long ago, the others yesterday.
    const recentAttempts = all
      .filter(id => !id.endsWith('q12'))
      .map(id =>
        answered(id, id.endsWith('q01') ? '2026-10-15T08:00:00.000Z' : '2026-11-09T08:00:00.000Z'),
      );
    const { exerciseIds } = buildPracticeSession(context({ recentAttempts }));
    expect(exerciseIds).toEqual(
      expect.arrayContaining(['react.hooks.mid.q12', 'react.hooks.mid.q01']),
    );
  });

  it('is deterministic for a seed and varies with it', () => {
    expect(buildPracticeSession(context())).toEqual(buildPracticeSession(context()));
    const seeds = [1, 2, 3, 4, 5].map(seed =>
      buildPracticeSession(context({ seed })).exerciseIds.join(),
    );
    expect(new Set(seeds).size).toBeGreaterThan(1);
  });

  it('is empty without a scope or for a topic without exercises', () => {
    expect(buildPracticeSession(context({ scope: undefined })).exerciseIds).toEqual([]);
    expect(
      buildPracticeSession(context({ scope: { topicIds: ['react.gone.mid'] } })).exerciseIds,
    ).toEqual([]);
  });
});
