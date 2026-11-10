import type { ReorderItemState } from '@/shared/ui';

type ItemFacts = {
  /** Current order, as item indices. */
  order: readonly number[];
  revealed: boolean;
};

export type OrderItemView = {
  /** Index of the item in the payload (its correct position is index + 1). */
  item: number;
  state: ReorderItemState;
  /** After reveal: the 1-based correct position of a misplaced item, else null. */
  correctPosition: number | null;
};

/** Pure (design system §5): per-item state in the current order; green in place, red if not. */
export function orderItemStates({ order, revealed }: ItemFacts): OrderItemView[] {
  return order.map((item, position) => {
    if (!revealed) {
      return { item, state: 'idle', correctPosition: null };
    }
    const inPlace = item === position;
    return {
      item,
      state: inPlace ? 'correct' : 'wrong',
      correctPosition: inPlace ? null : item + 1,
    };
  });
}
