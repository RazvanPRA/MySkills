import { z } from 'zod';
import type { ExerciseTypeLookup } from '../model/exerciseType';

/** Builders for raw (unvalidated) content, as it would appear in a JSON pack. */
export const rawCategory = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: { ro: `Categoria ${id}`, en: `Category ${id}` },
  testKinds: ['knowledge'],
  order: 1,
  ...extra,
});

export const rawTopic = (id: string, categoryId: string, extra: Record<string, unknown> = {}) => ({
  id,
  categoryId,
  title: { ro: `Topic ${id}` },
  level: 'mid',
  summary: { ro: 'Rezumat.' },
  ...extra,
});

export const rawExercise = (id: string, topicId: string, extra: Record<string, unknown> = {}) => ({
  id,
  type: 'fake_choice',
  topicId,
  level: 'mid',
  difficulty: 3,
  estimatedSeconds: 60,
  prompt: { ro: 'Întrebare?' },
  payload: { options: ['a', 'b'], correct: 0 },
  explanation: { ro: 'Pentru că.' },
  ...extra,
});

export const rawPack = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  version: '1.0.0',
  schemaVersion: 1,
  title: { ro: `Pachet ${id}` },
  categories: [],
  topics: [],
  exercises: [],
  ...extra,
});

/** A fake exercise type registry with one type whose payload has a real schema. */
export const fakeExerciseTypes: ExerciseTypeLookup = {
  get: type =>
    type === 'fake_choice'
      ? {
          payloadSchema: z.object({
            options: z.array(z.string()).min(2),
            correct: z.number().int().min(0),
          }),
        }
      : undefined,
};

/** A small valid pack: 2 categories, 3 topics (one prerequisite), 2 exercises. */
export const validPack = () =>
  rawPack('frontend', {
    categories: [rawCategory('react', { order: 2 }), rawCategory('nextjs', { order: 1 })],
    topics: [
      rawTopic('react.hooks', 'react', { level: 'senior' }),
      rawTopic('react.basics', 'react', { level: 'junior' }),
      rawTopic('nextjs.rsc', 'nextjs', { prerequisites: ['react.hooks'] }),
    ],
    exercises: [
      rawExercise('react.hooks.q02', 'react.hooks'),
      rawExercise('react.hooks.q01', 'react.hooks'),
    ],
  });
