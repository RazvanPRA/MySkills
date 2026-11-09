import type { ReactNode } from 'react';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Right-side slot. */
  accessory?: ReactNode;
};
