import type { EvaluationResult } from '@/shared/domain';
import type { CodeLineState } from '@/shared/ui';
import type { FindBugAnswer, FindBugPayload } from '../model/schemas';

/** Pure: right when the tapped line is one of the bug lines. */
export function evaluateFindBug(payload: FindBugPayload, answer: FindBugAnswer): EvaluationResult {
  const correct = payload.bugLines.includes(answer.line);
  return { correct, score: correct ? 1 : 0 };
}

type LineFacts = {
  lineCount: number;
  bugLines: readonly number[];
  /** The tapped line, or null. */
  picked: number | null;
  revealed: boolean;
};

/**
 * Pure (design system §5): the state of every line, index = line - 1. Before reveal only the
 * pick is marked; after reveal bug lines are green and a wrong pick red.
 */
export function bugLineStates({
  lineCount,
  bugLines,
  picked,
  revealed,
}: LineFacts): CodeLineState[] {
  return Array.from({ length: lineCount }, (_, index) => {
    const line = index + 1;
    const isBug = bugLines.includes(line);
    if (revealed && isBug) {
      return 'correct';
    }
    if (line !== picked) {
      return 'idle';
    }
    return revealed ? 'wrong' : 'selected';
  });
}
