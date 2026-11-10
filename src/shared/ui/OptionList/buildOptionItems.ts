import { optionState } from '../OptionRow';
import type { OptionListItem } from './OptionList.types';

type OptionFacts = {
  /** Option texts (Markdown), already in the UI language. */
  texts: readonly string[];
  /** Indices the user picked. */
  picked: ReadonlySet<number>;
  /** Indices that are part of the correct answer. */
  correct: ReadonlySet<number>;
  revealed: boolean;
  /** Display order as option indices (a permutation); defaults to the authored order. */
  order?: readonly number[];
};

/**
 * Pure: choice facts → OptionList items, in display order. Ids stay the authored option
 * indices as strings, so answers never depend on where an option is shown.
 */
export const buildOptionItems = ({
  texts,
  picked,
  correct,
  revealed,
  order,
}: OptionFacts): OptionListItem[] =>
  (order ?? texts.map((_, index) => index)).map(index => ({
    id: String(index),
    text: texts[index] ?? '',
    checked: picked.has(index),
    state: optionState({ picked: picked.has(index), isCorrect: correct.has(index), revealed }),
  }));
