import type { OptionState } from './OptionRow.types';

type OptionFacts = {
  /** The user picked it. */
  picked: boolean;
  /** It is part of the correct answer. */
  isCorrect: boolean;
  revealed: boolean;
};

/**
 * Design system §5/§6.1: before reveal only the pick is shown; after reveal correct options
 * are green, the user's wrong picks red, untouched wrong options stay neutral.
 */
export function optionState({ picked, isCorrect, revealed }: OptionFacts): OptionState {
  if (!revealed) {
    return picked ? 'selected' : 'idle';
  }
  if (isCorrect) {
    return 'correct';
  }
  return picked ? 'wrong' : 'idle';
}
