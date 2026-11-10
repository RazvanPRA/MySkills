import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { createStyles } from './ActionRow.styles';

type ActionRowProps = {
  /** Buttons, secondary first: the single primary action goes last (right), design system §4. */
  children: ReactNode;
};

/** A right-aligned row of actions that wraps on small screens and long Romanian labels. */
export function ActionRow({ children }: ActionRowProps) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.row}>{children}</View>;
}
