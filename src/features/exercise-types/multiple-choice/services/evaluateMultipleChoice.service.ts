import type { EvaluationResult } from '@/shared/domain';
import type { MultipleChoiceAnswer, MultipleChoicePayload } from '../model/schemas';

/**
 * Pure, with partial credit: score = (right picks − wrong picks) / correct options, floored at 0,
 * so ticking every option never pays off. Correct only when the picks match exactly.
 */
export function evaluateMultipleChoice(
  payload: MultipleChoicePayload,
  answer: MultipleChoiceAnswer,
): EvaluationResult {
  const correctSet = new Set(payload.correctIndices);
  const picked = new Set(answer.indices);
  const earned = [...picked].filter(index => correctSet.has(index)).length;
  const wrongPicks = picked.size - earned;
  const total = correctSet.size;
  const correct = wrongPicks === 0 && earned === total;
  const score = correct ? 1 : Math.max(0, (earned - wrongPicks) / total);
  return { correct, score, credit: { earned, total } };
}

/** Pure: adds the option to the picks, or removes it if it was picked. */
export function togglePick(indices: readonly number[], index: number): number[] {
  return indices.includes(index)
    ? indices.filter(picked => picked !== index)
    : [...indices, index].sort((a, b) => a - b);
}
