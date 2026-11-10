import { useCallback, useMemo } from 'react';
import { OptionList } from './OptionList';
import { useOrderedOptionItems } from './useOrderedOptionItems';

export type SingleChoiceListProps = {
  /** Seeds the stable display order (e.g. the exercise id). */
  orderKey: string;
  /** Option texts (Markdown), already in the UI language. */
  texts: readonly string[];
  /** The picked option index, or null. */
  picked: number | null;
  correctIndex: number;
  revealed: boolean;
  onPick: (index: number) => void;
};

/** One-answer options (`radio`), shuffled per key; after reveal correct green, wrong pick red. */
export function SingleChoiceList({
  orderKey,
  texts,
  picked,
  correctIndex,
  revealed,
  onPick,
}: SingleChoiceListProps) {
  const pickedList = useMemo(() => (picked === null ? [] : [picked]), [picked]);
  const correct = useMemo(() => [correctIndex], [correctIndex]);
  const items = useOrderedOptionItems({
    orderKey,
    texts,
    picked: pickedList,
    correct,
    revealed,
  });
  const handlePress = useCallback((id: string) => onPick(Number(id)), [onPick]);
  return <OptionList options={items} role="radio" onPress={handlePress} disabled={revealed} />;
}
