import { createRegistry, type Registry } from '@/shared/registry';
import type { ExerciseTypeDefinition } from '../model/exerciseType';

export type ExerciseTypeRegistry = Registry<ExerciseTypeDefinition>;

export const createExerciseTypeRegistry = (): ExerciseTypeRegistry =>
  createRegistry<ExerciseTypeDefinition>('ExerciseTypeRegistry', definition => definition.type);

/**
 * Declares an exercise type with full typing inside its module, and erases the payload and
 * answer types for the registry. This is safe because the player only calls `evaluate` and the
 * `Renderer` with data that already passed `payloadSchema` and `answerSchema`.
 */
export function defineExerciseType<TPayload, TAnswer>(
  definition: ExerciseTypeDefinition<TPayload, TAnswer>,
): ExerciseTypeDefinition {
  return definition as unknown as ExerciseTypeDefinition;
}
