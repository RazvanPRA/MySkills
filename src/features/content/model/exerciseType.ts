import type { ComponentType } from 'react';
import type { z } from 'zod';
import type { EvaluationResult, ReviewRating } from '@/shared/domain';
import type { Exercise } from './schemas';

/** What the generic session player passes to every exercise renderer. */
export type ExerciseRendererProps<TPayload, TAnswer> = {
  exercise: Exercise<TPayload>;
  /** The draft answer, or null before the user interacts. */
  answer: TAnswer | null;
  onAnswerChange: (answer: TAnswer) => void;
  /** After "Verifică" (or "Arată răspunsul"): the answer area shows the solution. */
  revealed: boolean;
  result: EvaluationResult | null;
};

/**
 * How the player runs an exercise:
 * - `check`: the user answers, "Verifică" evaluates and reveals the solution.
 * - `self_graded`: "Arată răspunsul" reveals a model answer first; the answer is then the
 *   user's own rating (flashcards).
 */
export type ExerciseFlow = 'check' | 'self_graded';

/**
 * Contract of an exercise type (brief §6.1). Each type lives in
 * src/features/exercise-types/<type>/ and is registered only in src/app/registries.ts.
 */
export type ExerciseTypeDefinition<TPayload = unknown, TAnswer = unknown> = {
  /** Value of `exercise.type` in content packs, e.g. "single_choice". */
  type: string;
  payloadSchema: z.ZodType<TPayload>;
  answerSchema: z.ZodType<TAnswer>;
  /**
   * Loaded lazily (`React.lazy`) so this definition imports no UI code at module load:
   * content validation runs it in Node, where React Native cannot load.
   */
  Renderer: ComponentType<ExerciseRendererProps<TPayload, TAnswer>>;
  /** Pure and synchronous: (payload, answer) → result. */
  evaluate: (payload: TPayload, answer: TAnswer) => EvaluationResult;
  /** Defaults to `check`. */
  flow?: ExerciseFlow;
  /** Maps a result (and optional self-rating) to an FSRS rating. A default mapping applies when absent. */
  toFsrsRating?: (result: EvaluationResult, confidence?: ReviewRating) => ReviewRating;
  /**
   * Reserved for types graded remotely (`free_text_ai_graded`, Phase 5).
   * When present, the player awaits it instead of calling `evaluate`.
   */
  evaluateRemote?: (payload: TPayload, answer: TAnswer) => Promise<EvaluationResult>;
};

/**
 * What content validation needs from the exercise type registry: only the payload schemas.
 * Kept narrow so content does not depend on renderers or evaluators.
 */
export type ExerciseTypeLookup = {
  get: (type: string) => Pick<ExerciseTypeDefinition, 'payloadSchema'> | undefined;
};

/** What the session player needs: full (type-erased) definitions. The registry satisfies it. */
export type ExerciseTypeResolver = {
  get: (type: string) => ExerciseTypeDefinition | undefined;
};
