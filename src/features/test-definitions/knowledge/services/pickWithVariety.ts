/** Something that can be picked into a session. */
export type Candidate = { id: string; topicId: string; categoryId: string };

/** A group of candidates in priority order, with how many of them may be picked. */
export type PickPhase<T extends Candidate> = { candidates: readonly T[]; max: number };

type VarietyRules = { target: number; maxPerCategory: number };

/**
 * Constraints, from strict to loose. Variety must not make a test shorter than the pool
 * allows: when strict rules leave slots empty, the same topic may repeat, then the
 * category cap is lifted (brief §7.1.5 "when alternatives exist").
 */
const RELAXATIONS = ['strict', 'repeatTopic', 'anyCategory'] as const;
type Relaxation = (typeof RELAXATIONS)[number];

type PickState = { ids: Set<string>; topics: Set<string>; perCategory: Map<string, number> };

type Policy = { relax: Relaxation; maxPerCategory: number };

function allowed(item: Candidate, state: PickState, { relax, maxPerCategory }: Policy) {
  if (state.ids.has(item.id)) {
    return false;
  }
  const categoryFull = (state.perCategory.get(item.categoryId) ?? 0) >= maxPerCategory;
  const topicUsed = state.topics.has(item.topicId);
  return relax === 'anyCategory' || (!categoryFull && (relax === 'repeatTopic' || !topicUsed));
}

function take(item: Candidate, state: PickState) {
  state.ids.add(item.id);
  state.topics.add(item.topicId);
  state.perCategory.set(item.categoryId, (state.perCategory.get(item.categoryId) ?? 0) + 1);
}

/**
 * Pure: fills up to `target` items, phase by phase (each up to its `max`), honouring variety.
 * Returns the picks of each phase, in pick order.
 */
export function pickWithVariety<T extends Candidate>(
  phases: readonly PickPhase<T>[],
  rules: VarietyRules,
): T[][] {
  const state: PickState = { ids: new Set(), topics: new Set(), perCategory: new Map() };
  const picks = phases.map((): T[] => []);
  for (const relax of RELAXATIONS) {
    const policy: Policy = { relax, maxPerCategory: rules.maxPerCategory };
    phases.forEach((phase, index) => {
      const phasePicks = picks[index] as T[];
      for (const item of phase.candidates) {
        if (state.ids.size >= rules.target || phasePicks.length >= phase.max) {
          return;
        }
        if (allowed(item, state, policy)) {
          take(item, state);
          phasePicks.push(item);
        }
      }
    });
  }
  return picks;
}
