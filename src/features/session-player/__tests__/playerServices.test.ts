import { buildContentCatalog, defineExerciseType, type Exercise } from '@/features/content';
import type { DailySession } from '@/features/daily-tests';
import { strings } from '@/shared/i18n';
import { z } from 'zod';
import type { Attempt } from '../model/attempt';
import { buildAttempt } from '../services/buildAttempt.service';
import { nextPrimaryAction } from '../services/nextPrimaryAction.service';
import { progressSession, resumeIndex, sessionScore } from '../services/progressSession.service';
import { summarizeSession } from '../services/summarizeSession.service';
import { verdictOf } from '../services/verdictOf.service';

const attempt = (exerciseId: string, score: number, correct = score === 1): Attempt => ({
  id: `a-${exerciseId}`,
  sessionId: 's1',
  exerciseId,
  answer: null,
  result: { correct, score },
  durationMs: 1000,
  answeredAt: '2026-11-10T08:00:00.000Z',
});

describe('nextPrimaryAction', () => {
  const check = { flow: 'check' as const };
  const selfGraded = { flow: 'self_graded' as const };
  const answering = { step: 'answering' as const, isLast: false };
  const revealed = { step: 'revealed' as const, isLast: false };
  it.each([
    [
      { ...check, ...answering, answerValid: false },
      { action: 'check', enabled: false },
    ],
    [
      { ...check, ...answering, answerValid: true },
      { action: 'check', enabled: true },
    ],
    [
      { ...check, ...revealed, answerValid: true },
      { action: 'next', enabled: true },
    ],
    [
      { ...check, ...revealed, isLast: true, answerValid: true },
      { action: 'finish', enabled: true },
    ],
    [
      { ...selfGraded, ...answering, answerValid: false },
      { action: 'show_answer', enabled: true },
    ],
    [
      { ...selfGraded, ...revealed, answerValid: false },
      { action: 'next', enabled: false },
    ],
    [
      { ...selfGraded, ...revealed, isLast: true, answerValid: true },
      { action: 'finish', enabled: true },
    ],
  ])('%j → %j', (facts, expected) => {
    expect(nextPrimaryAction(facts)).toEqual(expected);
  });
});

describe('verdictOf', () => {
  const player = strings.ro.player;
  it('writes the verdict as text, with partial credit when there is some', () => {
    expect(verdictOf({ correct: true, score: 1 }, player)).toEqual({
      verdict: 'correct',
      title: 'Corect',
    });
    expect(
      verdictOf({ correct: false, score: 0.5, credit: { earned: 2, total: 3 } }, player),
    ).toEqual({
      verdict: 'partial',
      title: 'Parțial corect (2/3)',
    });
    expect(
      verdictOf({ correct: false, score: 0, credit: { earned: 1, total: 3 } }, player),
    ).toEqual({
      verdict: 'wrong',
      title: 'Greșit',
    });
    expect(verdictOf({ correct: false, score: 0.33 }, player).verdict).toBe('wrong');
  });
});

describe('session progress', () => {
  const session: DailySession = {
    id: 's1',
    date: '2026-11-10',
    testKind: 'knowledge',
    exerciseIds: ['a', 'b', 'c'],
    status: 'pending',
  };
  const NOW = new Date('2026-11-10T09:00:00.000Z');

  it('resumes at the first unanswered exercise', () => {
    expect(resumeIndex(['a', 'b', 'c'], [])).toBe(0);
    expect(resumeIndex(['a', 'b', 'c'], [attempt('a', 1), attempt('c', 0)])).toBe(1);
    expect(resumeIndex(['a', 'b'], [attempt('a', 1), attempt('b', 1)])).toBe(2);
  });

  it('scores over every exercise, unanswered ones as 0', () => {
    expect(sessionScore(['a', 'b'], [attempt('a', 1)])).toBe(0.5);
    expect(sessionScore([], [])).toBe(0);
  });

  it('starts the session on the first answer', () => {
    expect(
      progressSession({
        session,
        attempts: [attempt('a', 1)],
        exerciseIds: ['a', 'b', 'c'],
        now: NOW,
      }),
    ).toEqual({
      ...session,
      status: 'in_progress',
      startedAt: NOW.toISOString(),
    });
  });

  it('completes it with its score on the last answer, keeping the start time', () => {
    const started = {
      ...session,
      status: 'in_progress' as const,
      startedAt: '2026-11-10T08:50:00.000Z',
    };
    const attempts = [attempt('a', 1), attempt('b', 0.5, false), attempt('c', 0)];
    expect(
      progressSession({ session: started, attempts, exerciseIds: ['a', 'b', 'c'], now: NOW }),
    ).toEqual({
      ...started,
      status: 'completed',
      completedAt: NOW.toISOString(),
      score: 0.5,
    });
  });
});

const exercise = (id: string, topicId: string): Exercise => ({
  id,
  type: 'pick',
  topicId,
  level: 'mid',
  difficulty: 2,
  estimatedSeconds: 30,
  prompt: { ro: '?' },
  payload: { correct: 1 },
  explanation: { ro: '.' },
  tags: [],
  source: 'pack',
  version: 1,
});

describe('summarizeSession', () => {
  const { catalog } = buildContentCatalog(
    [
      {
        id: 'p',
        version: '1.0.0',
        schemaVersion: 1,
        title: { ro: 'P' },
        categories: [{ id: 'react', title: { ro: 'React' }, testKinds: ['knowledge'], order: 1 }],
        topics: ['react.a.mid', 'react.b.mid'].map(id => ({
          id,
          categoryId: 'react',
          title: { ro: id },
          level: 'mid',
          summary: { ro: '.' },
        })),
        exercises: [
          exercise('q1', 'react.a.mid'),
          exercise('q2', 'react.b.mid'),
          exercise('q3', 'react.b.mid'),
          exercise('q4', 'react.a.mid'),
        ],
      },
    ],
    { get: () => ({ payloadSchema: z.unknown() }) },
  );

  it('counts correct answers, scores and lists topics with mistakes, most first', () => {
    const attempts = [
      attempt('q1', 1),
      attempt('q2', 0),
      attempt('q3', 0.5, false),
      attempt('q4', 0),
    ];
    expect(summarizeSession(['q1', 'q2', 'q3', 'q4'], attempts, catalog)).toEqual({
      correct: 1,
      total: 4,
      percent: 38,
      verdict: 'weak',
      toReview: [
        { topicId: 'react.b.mid', mistakes: 2 },
        { topicId: 'react.a.mid', mistakes: 1 },
      ],
    });
  });

  it.each([
    [[1, 1, 1, 1], 'strong'],
    [[1, 1, 0, 1], 'fair'],
    [[1, 0, 0, 1], 'fair'],
    [[1, 0, 0, 0], 'weak'],
  ])('%j → %s', (scores, verdict) => {
    const ids = ['q1', 'q2', 'q3', 'q4'];
    const attempts = ids.map((id, index) => attempt(id, scores[index] ?? 0));
    expect(summarizeSession(ids, attempts, catalog).verdict).toBe(verdict);
  });

  it('ignores attempts outside the session', () => {
    expect(summarizeSession(['q1'], [attempt('q1', 1), attempt('q2', 0)], catalog)).toMatchObject({
      correct: 1,
      total: 1,
      toReview: [],
    });
  });
});

describe('buildAttempt', () => {
  const pick = defineExerciseType<{ correct: number }, { index: number }>({
    type: 'pick',
    payloadSchema: z.object({ correct: z.number() }),
    answerSchema: z.object({ index: z.number() }),
    Renderer: () => null,
    evaluate: (payload, answer) => ({
      correct: payload.correct === answer.index,
      score: payload.correct === answer.index ? 1 : 0,
    }),
  });
  const input = (draft: unknown, definition = pick) => ({
    definition,
    exercise: exercise('q1', 'react.a.mid'),
    draft,
    ids: { attemptId: 'a1', sessionId: 's1' },
    times: { shownAt: '2026-11-10T08:00:00.000Z', now: new Date('2026-11-10T08:00:42.000Z') },
  });

  it('evaluates a valid answer into an attempt with its duration and FSRS rating', () => {
    expect(buildAttempt(input({ index: 1 }))).toEqual({
      attempt: {
        id: 'a1',
        sessionId: 's1',
        exerciseId: 'q1',
        answer: { index: 1 },
        result: { correct: true, score: 1 },
        durationMs: 42_000,
        answeredAt: '2026-11-10T08:00:42.000Z',
      },
      rating: 3,
    });
    expect(buildAttempt(input({ index: 0 }))?.rating).toBe(1);
  });

  it('rejects an answer that does not match the type', () => {
    expect(buildAttempt(input(null))).toBeNull();
    expect(buildAttempt(input({ index: 'x' }))).toBeNull();
  });

  it('stores a self-graded rating as the attempt confidence', () => {
    const selfGraded = { ...pick, flow: 'self_graded' as const, toFsrsRating: () => 2 as const };
    expect(buildAttempt(input({ index: 1 }, selfGraded))).toMatchObject({
      attempt: { confidence: 2 },
      rating: 2,
    });
  });
});
