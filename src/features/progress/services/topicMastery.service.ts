import { MASTERY_PARAMS, type MasteryParams } from '../model/constants';
import type { AttemptFact } from '../model/facts';

const DAY_MS = 86_400_000;

export type TopicMasteryInput = {
  attempts: readonly Pick<AttemptFact, 'score' | 'answeredAt'>[];
  /** FSRS stability (days) of the topic's review cards; empty for logic topics. */
  stabilities: readonly number[];
  /** ISO instant the mastery is computed for. */
  now: string;
};

/** Decayed weighted average of scores, pulled toward 0 by `priorWeight` (0..1). */
function recentScore(input: TopicMasteryInput, params: MasteryParams): number {
  const now = Date.parse(input.now);
  let weighted = 0;
  let weights = 0;
  for (const attempt of input.attempts) {
    const ageDays = Math.max(0, (now - Date.parse(attempt.answeredAt)) / DAY_MS);
    const weight = 0.5 ** (ageDays / params.halfLifeDays);
    weighted += weight * attempt.score;
    weights += weight;
  }
  return weighted / (weights + params.priorWeight);
}

/** How well FSRS expects the topic to be remembered (0..1), from card stability. */
function memoryScore(stabilities: readonly number[], params: MasteryParams): number {
  const total = stabilities.reduce(
    (sum, stability) => sum + stability / (stability + params.stabilityHalfDays),
    0,
  );
  return total / stabilities.length;
}

/**
 * Topic mastery 0–100 (brief §8): recent attempt scores with time decay, combined with FSRS
 * stability when the topic has review cards. Null when the topic was never attempted.
 */
export function calculateTopicMastery(
  input: TopicMasteryInput,
  params: MasteryParams = MASTERY_PARAMS,
): number | null {
  if (input.attempts.length === 0) {
    return null;
  }
  const recent = recentScore(input, params);
  const combined =
    input.stabilities.length === 0
      ? recent
      : (1 - params.stabilityShare) * recent +
        params.stabilityShare * memoryScore(input.stabilities, params);
  return Math.round(combined * 100);
}
