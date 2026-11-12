import type { ReactNode } from 'react';

export type SetupRowProps = {
  /** Already translated, shown as a small uppercase label. */
  label: string;
  /** The control: a SegmentedControl, Chips, a Button... */
  children: ReactNode;
  /** Muted caption under the control. */
  help?: string;
};
