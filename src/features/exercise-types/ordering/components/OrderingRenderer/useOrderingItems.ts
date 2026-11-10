import { useCallback, useMemo } from 'react';
import { AccessibilityInfo } from 'react-native';
import type { Exercise } from '@/features/content';
import { useLocalizedTexts, useStrings } from '@/shared/i18n';
import type { ReorderDirection, ReorderListItem } from '@/shared/ui';
import type { OrderingAnswer, OrderingPayload } from '../../model/schemas';
import { orderItemStates } from '../../services/orderItemStates';
import { moveItem, startingOrder } from '../../services/reorder';

type Input = {
  exercise: Exercise<OrderingPayload>;
  answer: OrderingAnswer | null;
  onAnswerChange: (answer: OrderingAnswer) => void;
  revealed: boolean;
};

/**
 * The current order (the draft, or the shuffled starting order before the first move) as
 * ReorderList items, and the move handler, which announces the new position.
 */
export function useOrderingItems({ exercise, answer, onAnswerChange, revealed }: Input) {
  const { exercise: strings } = useStrings();
  const texts = useLocalizedTexts(exercise.payload.items);
  const order = useMemo(
    () => answer?.order ?? startingOrder(exercise.id, texts.length),
    [answer, exercise.id, texts.length],
  );
  const items = useMemo<ReorderListItem[]>(
    () =>
      orderItemStates({ order, revealed }).map(({ item, state, correctPosition }) => ({
        id: String(item),
        text: texts[item] ?? '',
        state,
        caption: revealed
          ? correctPosition === null
            ? strings.inPlace
            : strings.correctPosition(correctPosition)
          : undefined,
      })),
    [order, revealed, texts, strings],
  );
  const handleMove = useCallback(
    (id: string, direction: ReorderDirection) => {
      const next = moveItem(order, Number(id), direction);
      onAnswerChange({ order: next });
      AccessibilityInfo.announceForAccessibility(strings.movedTo(next.indexOf(Number(id)) + 1));
    },
    [order, onAnswerChange, strings],
  );
  return { items, handleMove };
}
