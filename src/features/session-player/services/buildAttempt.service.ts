import type { Exercise, ExerciseTypeDefinition } from '@/features/content';
import { defaultFsrsRating } from '@/features/spaced-repetition';
import type { ReviewRating } from '@/shared/domain';
import type { Attempt } from '../model/attempt';

type AttemptInput = {
  definition: ExerciseTypeDefinition;
  exercise: Exercise;
  /** The user's draft answer; must pass the type's answerSchema. */
  draft: unknown;
  ids: { attemptId: string; sessionId: string };
  times: { shownAt: string; now: Date };
};

export type BuiltAttempt = { attempt: Attempt; rating: ReviewRating };

/**
 * Pure: validates and evaluates an answer and builds the attempt to store, plus the FSRS
 * rating it implies. Returns null for an answer that does not pass the type's answerSchema.
 */
export function buildAttempt({
  definition,
  exercise,
  draft,
  ids,
  times,
}: AttemptInput): BuiltAttempt | null {
  const parsed = definition.answerSchema.safeParse(draft);
  if (!parsed.success) {
    return null;
  }
  const result = definition.evaluate(exercise.payload, parsed.data);
  const rating = (definition.toFsrsRating ?? defaultFsrsRating)(result);
  // A self-graded answer is the user's own confidence rating (Attempt.confidence).
  const confidence = definition.flow === 'self_graded' ? { confidence: rating } : {};
  const attempt: Attempt = {
    id: ids.attemptId,
    sessionId: ids.sessionId,
    exerciseId: exercise.id,
    answer: parsed.data,
    result,
    durationMs: Math.max(0, times.now.getTime() - Date.parse(times.shownAt)),
    ...confidence,
    answeredAt: times.now.toISOString(),
  };
  return { attempt, rating };
}
