import { configureStore } from '@reduxjs/toolkit';
import { buildContentCatalog } from '@/features/content';
import type { AttemptRepository } from '@/features/session-player';
import { defaultUserSettings, settingsReducer } from '@/features/settings';
import { strings } from '@/shared/i18n';
import { fixedClock } from '@/shared/utils/clock';
import type { DailySession } from '../model/dailySession';
import type { TestDefinition } from '../model/testDefinition';
import type { SessionRepository } from '../repository/SessionRepository';
import { presentTodayCard } from '../services/presentTodayCard';
import { reconcileDailySession } from '../services/reconcileDailySession.service';
import { attemptsSince, sessionSeed } from '../services/sessionHelpers';
import { createTestRegistry } from '../services/testRegistry';
import { dailyTestsReducer, type TodayCardState } from '../state/slice';
import { loadToday } from '../state/thunks';

const pending = (exerciseIds: string[]): DailySession => ({
  id: 's1',
  date: '2026-11-10',
  testKind: 'knowledge',
  exerciseIds,
  status: 'pending',
});

describe('reconcileDailySession', () => {
  const base = { date: '2026-11-10', testKind: 'knowledge', newId: () => 'new-id' };

  it('creates a pending session on the first open of the day', () => {
    expect(
      reconcileDailySession({ ...base, existing: null, plan: { exerciseIds: ['a', 'b'] } }),
    ).toEqual({
      session: {
        id: 'new-id',
        date: '2026-11-10',
        testKind: 'knowledge',
        exerciseIds: ['a', 'b'],
        status: 'pending',
      },
      changed: true,
    });
  });

  it('stores nothing when there is nothing to test', () => {
    expect(reconcileDailySession({ ...base, existing: null, plan: { exerciseIds: [] } })).toEqual({
      session: null,
      changed: false,
    });
  });

  it('keeps a pending session that matches the plan, and updates one that does not', () => {
    const existing = pending(['a']);
    expect(reconcileDailySession({ ...base, existing, plan: { exerciseIds: ['a'] } })).toEqual({
      session: existing,
      changed: false,
    });
    expect(reconcileDailySession({ ...base, existing, plan: { exerciseIds: ['a', 'b'] } })).toEqual(
      {
        session: { ...existing, exerciseIds: ['a', 'b'] },
        changed: true,
      },
    );
  });

  it('freezes a started or completed session (same test all day)', () => {
    for (const status of ['in_progress', 'completed'] as const) {
      const existing = { ...pending(['a']), status };
      expect(reconcileDailySession({ ...base, existing, plan: { exerciseIds: ['x'] } })).toEqual({
        session: existing,
        changed: false,
      });
    }
  });

  it('seeds by date and kind', () => {
    expect(sessionSeed('2026-11-10', 'knowledge')).toBe(sessionSeed('2026-11-10', 'knowledge'));
    expect(sessionSeed('2026-11-10', 'knowledge')).not.toBe(sessionSeed('2026-11-11', 'knowledge'));
  });
});

const exercise = (id: string, estimatedSeconds: number) => ({
  id,
  type: 'any',
  topicId: 'react.hooks.mid',
  level: 'mid',
  difficulty: 2,
  estimatedSeconds,
  prompt: { ro: '?' },
  payload: {},
  explanation: { ro: '.' },
});
const { catalog } = buildContentCatalog(
  [
    {
      id: 'p',
      version: '1.0.0',
      schemaVersion: 1,
      title: { ro: 'P' },
      categories: [{ id: 'react', title: { ro: 'React' }, testKinds: ['knowledge'], order: 1 }],
      topics: [
        {
          id: 'react.hooks.mid',
          categoryId: 'react',
          title: { ro: 'Hooks' },
          level: 'mid',
          summary: { ro: '.' },
        },
      ],
      exercises: [exercise('q1', 60), exercise('q2', 90), exercise('q3', 60)],
    },
  ],
  {
    get: () => ({
      payloadSchema: { safeParse: (data: unknown) => ({ success: true as const, data }) },
    }),
  } as never,
);

describe('presentTodayCard', () => {
  const card = (overrides: Partial<TodayCardState>): TodayCardState => ({
    kind: 'knowledge',
    title: { ro: 'Test de cunoștințe', en: 'Knowledge test' },
    itemKind: 'question',
    session: pending(['q1', 'q2', 'q3']),
    shortfall: null,
    answered: 0,
    ...overrides,
  });
  const present = (overrides: Partial<TodayCardState>, language: 'ro' | 'en' = 'ro') =>
    presentTodayCard({ card: card(overrides), catalog, strings: strings[language], language });

  it('offers "Începe" for a pending test, with size and duration', () => {
    expect(present({})).toEqual({
      kind: 'knowledge',
      title: 'Test de cunoștințe',
      meta: '3 întrebări · ~4 minute',
      statusLabel: 'Neînceput',
      primary: { label: 'Începe', sessionId: 's1' },
      scoreText: null,
      notice: null,
      showMarkTopics: false,
    });
  });

  it('offers "Continuă" with progress for a started test', () => {
    const model = present({
      session: { ...pending(['q1', 'q2', 'q3']), status: 'in_progress' },
      answered: 2,
    });
    expect(model).toMatchObject({ statusLabel: 'În lucru 2/3', primary: { label: 'Continuă' } });
  });

  it('replaces the button with the score when done', () => {
    const model = present({ session: { ...pending(['q1']), status: 'completed', score: 0.666 } });
    expect(model).toMatchObject({ statusLabel: 'Gata', primary: null, scoreText: 'Scor: 67%' });
  });

  it('explains a short test and offers to mark topics', () => {
    const model = present({ shortfall: { target: 10, available: 3, remedy: 'mark_topics' } });
    expect(model.notice).toBe(
      'Doar 3 din 10 întrebări disponibile azi. Marchează mai multe topicuri pentru un test complet.',
    );
    expect(model).toMatchObject({ showMarkTopics: true, primary: { label: 'Începe' } });
  });

  it('shows the empty state when there is nothing to test', () => {
    const model = present({
      session: null,
      shortfall: { target: 10, available: 0, remedy: 'mark_topics' },
    });
    expect(model).toMatchObject({ meta: null, primary: null, showMarkTopics: true });
    expect(model.notice).toMatch(/Nicio întrebare disponibilă azi/);
  });

  it('explains a content-limited test without offering to mark topics', () => {
    const short = present({ shortfall: { target: 5, available: 2 } });
    expect(short.notice).toBe('Doar 2 din 5 probleme disponibile azi.');
    expect(short.showMarkTopics).toBe(false);
    const empty = present({ session: null, shortfall: { target: 5, available: 0 } });
    expect(empty).toMatchObject({
      notice: 'Nicio problemă disponibilă azi pentru acest test.',
      showMarkTopics: false,
      primary: null,
    });
  });

  it('counts problems for a test that declares them', () => {
    expect(present({ itemKind: 'problem' }).meta).toBe('3 probleme · ~4 minute');
    expect(present({ itemKind: 'problem' }, 'en').meta).toBe('3 problems · ~4 minutes');
  });

  it('skips exercises removed from the content', () => {
    expect(present({ session: pending(['q1', 'gone']) }).meta).toBe('1 întrebare · ~1 minut');
  });

  it('uses the UI language', () => {
    expect(present({}, 'en')).toMatchObject({
      title: 'Knowledge test',
      meta: '3 questions · ~4 minutes',
    });
  });
});

describe('loadToday', () => {
  function setup(stored: DailySession[] = [], answered = 0) {
    const sessions = new Map(stored.map(session => [session.id, session]));
    const sessionRepo: SessionRepository = {
      findByDateAndKind: async (date, kind) =>
        [...sessions.values()].find(s => s.date === date && s.testKind === kind) ?? null,
      findOpenByScope: async () => null,
      getById: async id => sessions.get(id) ?? null,
      listBetween: async () => [],
      save: async session => {
        sessions.set(session.id, session);
      },
    };
    const attempts: AttemptRepository = {
      add: async () => undefined,
      listBySession: async () => Array.from({ length: answered }, () => ({} as never)),
      listSince: async () => [],
    };
    const tests = createTestRegistry();
    const knowledge: TestDefinition = {
      kind: 'knowledge',
      title: { ro: 'Test de cunoștințe' },
      schedule: 'daily',
      spacedRepetition: true,
      buildSession: context => ({ exerciseIds: context.date === '2026-11-10' ? ['q1', 'q2'] : [] }),
    };
    tests.register(knowledge);
    tests.register({ ...knowledge, kind: 'weekly', schedule: 'weekly' });
    const store = configureStore({
      reducer: { settings: settingsReducer, dailyTests: dailyTestsReducer },
      preloadedState: { settings: { values: defaultUserSettings, loaded: true } },
      middleware: getDefault =>
        getDefault({
          thunk: {
            extraArgument: {
              // 23:30 local time on the 10th: still the 10th in the device's time zone.
              clock: fixedClock(new Date(2026, 10, 10, 23, 30).toISOString()),
              generateId: () => 'generated',
              registries: { tests },
              repositories: {
                sessions: sessionRepo,
                attempts,
                topicProgress: {
                  getAll: async () => [],
                  get: async () => null,
                  save: async () => undefined,
                },
                reviewCards: {
                  getAll: async () => [],
                  get: async () => null,
                  getDue: async () => [],
                  save: async () => undefined,
                },
              },
            },
          },
        }),
    });
    return { store, sessions };
  }

  it('creates and stores today’s session for every daily test (local day)', async () => {
    const { store, sessions } = setup();
    const { date, cards } = await store.dispatch(loadToday({ catalog })).unwrap();
    expect(date).toBe('2026-11-10');
    expect(cards.map(card => card.kind)).toEqual(['knowledge']);
    expect(cards[0]?.session).toMatchObject({
      id: 'generated',
      exerciseIds: ['q1', 'q2'],
      status: 'pending',
    });
    expect([...sessions.keys()]).toEqual(['generated']);
    expect(store.getState().dailyTests.status).toBe('ready');
  });

  it('reuses a started session and counts its answers', async () => {
    const started = { ...pending(['q3']), status: 'in_progress' as const };
    const { store } = setup([started], 1);
    const { cards } = await store.dispatch(loadToday({ catalog })).unwrap();
    expect(cards[0]).toMatchObject({ session: started, answered: 1 });
  });
});

describe('attemptsSince', () => {
  const at = (answeredAt: string) => ({ answeredAt });

  it('keeps attempts from the start of the local day `days` days ago onwards', () => {
    const since = new Date(2026, 10, 3).toISOString();
    const before = new Date(2026, 10, 2, 23, 59).toISOString();
    const today = new Date(2026, 10, 10, 9).toISOString();
    expect(
      attemptsSince([at(before), at(since), at(today)], { date: '2026-11-10', days: 7 }),
    ).toEqual([at(since), at(today)]);
  });
});
