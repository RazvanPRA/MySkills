import {
  DIFFICULTY_BOUNDS,
  DIFFICULTY_SPREAD,
  MIN_SUBCATEGORIES,
  REPEAT_SUBCATEGORY_COST,
} from '../model/constants';
import type { RankedCandidate } from './freshness';

/**
 * Seen problems cost more than any difficulty or variety mismatch, scaled by staleness so the
 * least recently seen always comes first (difficulty only breaks ties among equally old ones).
 */
const SEEN_COST = 1000;

/** Pure: per-slot target difficulties, evenly spread around the target and clamped. */
export function slotTargets(target: number, count: number): number[] {
  if (count <= 1) {
    return count === 1 ? [target] : [];
  }
  const step = (2 * DIFFICULTY_SPREAD) / (count - 1);
  return Array.from({ length: count }, (_, index) =>
    Math.min(
      DIFFICULTY_BOUNDS.max,
      Math.max(DIFFICULTY_BOUNDS.min, target - DIFFICULTY_SPREAD + index * step),
    ),
  );
}

type PickState = { picked: RankedCandidate[]; perSubcategory: Map<string, number> };

const cost = (candidate: RankedCandidate, slot: number, state: PickState) =>
  SEEN_COST * candidate.staleness +
  Math.abs(candidate.difficulty - slot) +
  REPEAT_SUBCATEGORY_COST * (state.perSubcategory.get(candidate.subcategory) ?? 0);

/** The cheapest candidate for a slot; the first one wins ties (candidates come shuffled). */
function cheapest(candidates: readonly RankedCandidate[], slot: number, state: PickState) {
  let best: RankedCandidate | undefined;
  let bestCost = Infinity;
  for (const candidate of candidates) {
    const value = cost(candidate, slot, state);
    if (value < bestCost) {
      best = candidate;
      bestCost = value;
    }
  }
  return best;
}

type PickInput = {
  /** Shuffled with the day's seed, so ties break differently each day. */
  candidates: readonly RankedCandidate[];
  count: number;
  target: number;
};

/**
 * Pure (brief §7.2): fills one slot per target difficulty with the cheapest problem: fresh
 * first, close to the slot's difficulty, spread over subcategories. While a slot is needed to
 * reach 3 subcategories, only new subcategories qualify.
 */
export function pickLogicProblems({ candidates, count, target }: PickInput): RankedCandidate[] {
  const distinct = new Set(candidates.map(candidate => candidate.subcategory)).size;
  const minSubcategories = Math.min(MIN_SUBCATEGORIES, distinct, count);
  const state: PickState = { picked: [], perSubcategory: new Map() };
  for (const slot of slotTargets(target, count)) {
    const open = candidates.filter(candidate => !state.picked.includes(candidate));
    const slotsLeft = count - state.picked.length;
    const mustAddSubcategory = minSubcategories - state.perSubcategory.size >= slotsLeft;
    const eligible = mustAddSubcategory
      ? open.filter(candidate => !state.perSubcategory.has(candidate.subcategory))
      : open;
    const choice = cheapest(eligible.length > 0 ? eligible : open, slot, state);
    if (!choice) {
      break;
    }
    state.picked.push(choice);
    state.perSubcategory.set(
      choice.subcategory,
      (state.perSubcategory.get(choice.subcategory) ?? 0) + 1,
    );
  }
  return state.picked;
}
