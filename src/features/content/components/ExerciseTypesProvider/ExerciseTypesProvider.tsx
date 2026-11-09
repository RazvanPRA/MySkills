import { createContext, type PropsWithChildren, useContext } from 'react';
import type { ExerciseTypeDefinition, ExerciseTypeResolver } from '../../model/exerciseType';

const ExerciseTypesContext = createContext<ExerciseTypeResolver | null>(null);

type ExerciseTypesProviderProps = PropsWithChildren<{ value: ExerciseTypeResolver }>;

/** Makes the exercise type registry (filled in src/app/registries.ts) available to the UI. */
export function ExerciseTypesProvider({ value, children }: ExerciseTypesProviderProps) {
  return <ExerciseTypesContext.Provider value={value}>{children}</ExerciseTypesContext.Provider>;
}

/** The definition of an exercise type, or undefined when it is not registered. */
export function useExerciseType(type: string): ExerciseTypeDefinition | undefined {
  const registry = useContext(ExerciseTypesContext);
  if (!registry) {
    throw new Error('useExerciseType must be used inside <ExerciseTypesProvider>');
  }
  return registry.get(type);
}
