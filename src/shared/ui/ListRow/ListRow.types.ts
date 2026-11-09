import type { ReactNode } from 'react';

export type ListRowProps = {
  title: string;
  /** Muted second line ("Senior · În lucru"). */
  meta?: string;
  /** Right-side slot, typically a Tag. */
  accessory?: ReactNode;
  onPress: () => void;
  disabled?: boolean;
};
