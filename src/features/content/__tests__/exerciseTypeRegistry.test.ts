import { z } from 'zod';
import { createExerciseTypeRegistry, defineExerciseType } from '../services/exerciseTypeRegistry';

// A fake exercise type, fully typed inside its "module".
const fakeChoice = defineExerciseType<{ correct: number }, number>({
  type: 'fake_choice',
  payloadSchema: z.object({ correct: z.number() }),
  answerSchema: z.number(),
  Renderer: () => null,
  evaluate: (payload, answer) => {
    const correct = payload.correct === answer;
    return { correct, score: correct ? 1 : 0 };
  },
});

describe('ExerciseTypeRegistry', () => {
  it('starts empty: types are registered only in src/app/registries.ts', () => {
    expect(createExerciseTypeRegistry().keys()).toEqual([]);
  });

  it('looks up a type and evaluates through the erased definition', () => {
    const registry = createExerciseTypeRegistry();
    registry.register(fakeChoice);
    const definition = registry.require('fake_choice');
    const payload = definition.payloadSchema.parse({ correct: 1 });
    expect(definition.evaluate(payload, 1)).toEqual({ correct: true, score: 1 });
    expect(definition.evaluate(payload, 0)).toEqual({ correct: false, score: 0 });
  });

  it('rejects registering the same type twice', () => {
    const registry = createExerciseTypeRegistry();
    registry.register(fakeChoice);
    expect(() => registry.register(fakeChoice)).toThrow('"fake_choice" is already registered');
  });

  it('satisfies the narrow lookup used by content validation', () => {
    const registry = createExerciseTypeRegistry();
    registry.register(fakeChoice);
    expect(registry.get('fake_choice')?.payloadSchema.safeParse({ correct: 'x' }).success).toBe(
      false,
    );
    expect(registry.get('unknown')).toBeUndefined();
  });
});
