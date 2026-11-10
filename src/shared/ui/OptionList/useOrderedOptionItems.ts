import { useMemo } from 'react';
import { seededPermutation } from '@/shared/utils/seededRandom';
import { buildOptionItems } from './buildOptionItems';
import type { OptionListItem } from './OptionList.types';

type OrderedOptions = {
  /** Seeds the display order, e.g. the exercise id: the same key always gives the same order. */
  orderKey: string;
  /** Option texts (Markdown), already in the UI language. */
  texts: readonly string[];
  /** Indices the user picked. */
  picked: readonly number[];
  /** Indices that are part of the correct answer. */
  correct: readonly number[];
  revealed: boolean;
};

/**
 * OptionList items in a stable shuffled order (authors tend to write the correct option
 * first). Ids stay the authored indices, so answers never depend on the display position.
 */
export function useOrderedOptionItems({
  orderKey,
  texts,
  picked,
  correct,
  revealed,
}: OrderedOptions): OptionListItem[] {
  const order = useMemo(() => seededPermutation(orderKey, texts.length), [orderKey, texts.length]);
  return useMemo(
    () =>
      buildOptionItems({
        texts,
        picked: new Set(picked),
        correct: new Set(correct),
        revealed,
        order,
      }),
    [texts, picked, correct, revealed, order],
  );
}
