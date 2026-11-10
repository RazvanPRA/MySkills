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
};

/** Pure: choice facts → OptionList items (ids are the option indices as strings). */
export const buildOptionItems = ({
  texts,
  picked,
  correct,
  revealed,
}: OptionFacts): OptionListItem[] =>
  texts.map((text, index) => ({
    id: String(index),
    text,
    checked: picked.has(index),
    state: optionState({ picked: picked.has(index), isCorrect: correct.has(index), revealed }),
  }));
