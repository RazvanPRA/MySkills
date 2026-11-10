import { seededPermutation } from '@/shared/utils/seededRandom';

/**
 * Pure: the order the items start in, stable per exercise and never already solved
 * (a shuffle that happens to be correct is rotated by one).
 */
export function startingOrder(exerciseId: string, length: number): number[] {
  const order = seededPermutation(exerciseId, length);
  const solved = order.every((item, position) => item === position);
  return solved ? [...order.slice(1), ...order.slice(0, 1)] : order;
}

/** Pure: moves `item` one place up or down; at the edge the order is unchanged. */
export function moveItem(
  order: readonly number[],
  item: number,
  direction: 'up' | 'down',
): number[] {
  const from = order.indexOf(item);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= order.length) {
    return [...order];
  }
  const next = [...order];
  [next[from], next[to]] = [next[to] as number, next[from] as number];
  return next;
}
