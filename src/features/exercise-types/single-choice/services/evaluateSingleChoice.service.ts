import type { EvaluationResult } from '@/shared/domain';
import type { SingleChoiceAnswer, SingleChoicePayload } from '../model/schemas';

/** Pure: right or wrong, no partial credit. */
export function evaluateSingleChoice(
  payload: SingleChoicePayload,
  answer: SingleChoiceAnswer,
): EvaluationResult {
  const correct = answer.index === payload.correctIndex;
  return { correct, score: correct ? 1 : 0 };
}
