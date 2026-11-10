import type { ReactNode } from 'react';

/** Visual state of an option: before reveal it can only be idle or selected. */
export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

export type OptionRowProps = {
  id: string;
  /** "A", "B", "C"… */
  letter: string;
  /** Plain text: the visible label (unless `children` is given) and the accessible name. */
  label: string;
  state: OptionState;
  /** Whether the user picked this option (also after reveal). */
  checked: boolean;
  /** `radio` for single choice, `checkbox` for multiple choice. */
  role: 'radio' | 'checkbox';
  /** One stable callback for the whole list, receiving the option id, so `memo` works. */
  onPress: (id: string) => void;
  /** After reveal the options are read-only. */
  disabled?: boolean;
  /** Rich label (e.g. Markdown with inline code); `label` stays the accessible name. */
  children?: ReactNode;
};
