import { toLocalDate } from '@/shared/utils/localDate';
import type { LogicCandidate } from './logicPool';

/** The latest attempt of an exercise within the no-repeat window. */
type Seen = { answeredAt: string; correct: boolean };

type AttemptFacts = { exerciseId: string; answeredAt: string; result: { correct: boolean } };

/** A candidate with its freshness: 0 = not seen in the window; 1, 2, … = seen, oldest first. */
export type RankedCandidate = LogicCandidate & { staleness: number };

function latestAttempts(attempts: readonly AttemptFacts[]): Map<string, Seen> {
  const latest = new Map<string, Seen>();
  for (const { exerciseId, answeredAt, result } of attempts) {
    const known = latest.get(exerciseId);
    if (!known || answeredAt > known.answeredAt) {
      latest.set(exerciseId, { answeredAt, correct: result.correct });
    }
  }
  return latest;
}

const localDay = (seen: Seen) => toLocalDate(new Date(seen.answeredAt));

/** Older days first; on the same local day, a wrong answer comes back before a right one. */
const bySeenOrder = (a: Seen, b: Seen) =>
  localDay(a).localeCompare(localDay(b)) || Number(a.correct) - Number(b.correct);

/**
 * Pure (brief §7.2.3 with the agreed fallback): problems not seen in the window rank 0; seen
 * ones rank after them, least recently seen first, so the test stays full once the pool is
 * used up instead of shrinking.
 */
export function rankByFreshness(
  pool: readonly LogicCandidate[],
  windowAttempts: readonly AttemptFacts[],
): RankedCandidate[] {
  const latest = latestAttempts(windowAttempts);
  const seenOrder = pool
    .filter(candidate => latest.has(candidate.id))
    .sort((a, b) => bySeenOrder(latest.get(a.id) as Seen, latest.get(b.id) as Seen));
  const rank = new Map(seenOrder.map((candidate, index) => [candidate.id, index + 1]));
  return pool.map(candidate => ({ ...candidate, staleness: rank.get(candidate.id) ?? 0 }));
}
