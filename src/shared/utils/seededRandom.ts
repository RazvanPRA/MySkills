/* eslint-disable no-bitwise -- FNV-1a and Mulberry32 are defined as 32-bit integer bit operations. */
/**
 * Deterministic randomness for session builders: the same seed always gives the same
 * sequence, so the same day always gives the same test (brief §6.2).
 */

export type RandomSource = () => number;

/** FNV-1a 32-bit hash: "2026-11-10:knowledge" → a stable unsigned seed. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32: a small, fast PRNG with good distribution. Returns values in [0, 1). */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  };
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other] as T, result[index] as T];
  }
  return result;
}

/**
 * Orders items by weighted sampling without replacement (Efraimidis–Spirakis):
 * heavier items tend to come first, but every item with weight > 0 can appear.
 * Items with weight <= 0 go last, in their original order.
 */
export function weightedOrder<T>(
  items: readonly T[],
  weight: (item: T) => number,
  random: RandomSource,
): T[] {
  const keyed = items.map((item, index) => {
    const w = weight(item);
    return { item, index, key: w > 0 ? Math.pow(random(), 1 / w) : -1 };
  });
  return keyed.sort((a, b) => b.key - a.key || a.index - b.index).map(entry => entry.item);
}
