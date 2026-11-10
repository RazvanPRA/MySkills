import type { ReactNode } from 'react';

export type ListRowProps = {
  title: string;
  /** Muted second line ("Senior · În lucru"). */
  meta?: string;
  /** Right-side slot, typically a Tag. */
  accessory?: ReactNode;
  /** Text of the accessory, added to the accessible name (a Tag is not announced on its own). */
  accessoryLabel?: string;
  onPress: () => void;
  disabled?: boolean;
};
