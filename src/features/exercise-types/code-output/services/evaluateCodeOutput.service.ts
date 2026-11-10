import type { EvaluationResult } from '@/shared/domain';
import type { CodeOutputAnswer, CodeOutputPayload } from '../model/schemas';

const SMART_QUOTES: ReadonlyArray<[RegExp, string]> = [
  [/[‘’]/g, "'"],
  [/[“”„]/g, '"'],
];

/**
 * Pure: typed output → comparable form. Whitespace runs (spaces, tabs, line breaks) become one
 * space, so "1\n2" equals "1 2" (typing line breaks on a phone is awkward); phone keyboards'
 * curly quotes become straight ones. Case and punctuation still count.
 */
export function normalizeOutput(text: string): string {
  const straight = SMART_QUOTES.reduce(
    (result, [pattern, quote]) => result.replace(pattern, quote),
    text,
  );
  return straight.replace(/\s+/g, ' ').trim();
}

const result = (correct: boolean): EvaluationResult => ({ correct, score: correct ? 1 : 0 });

/** Pure: right or wrong. An answer of the other mode (picked vs typed) is wrong. */
export function evaluateCodeOutput(
  payload: CodeOutputPayload,
  answer: CodeOutputAnswer,
): EvaluationResult {
  if (payload.mode === 'choice') {
    return result('index' in answer && answer.index === payload.correctIndex);
  }
  if (!('text' in answer)) {
    return result(false);
  }
  const typed = normalizeOutput(answer.text);
  return result(
    [payload.expected, ...payload.accepted].some(text => normalizeOutput(text) === typed),
  );
}
