import type { OptionState } from '../OptionRow';

export type OptionListItem = {
  id: string;
  /** Markdown (inline code is common in option text). */
  text: string;
  state: OptionState;
  /** The user picked it. */
  checked: boolean;
};

export type OptionListProps = {
  options: readonly OptionListItem[];
  /** `radio` for single choice, `checkbox` for multiple choice. */
  role: 'radio' | 'checkbox';
  /** One stable callback for the whole list, receiving the option id. */
  onPress: (id: string) => void;
  /** After reveal the options are read-only. */
  disabled?: boolean;
  /** Accessible name of the group (e.g. the instruction "Alege 2 răspunsuri"). */
  accessibilityLabel?: string;
};
