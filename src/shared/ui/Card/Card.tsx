import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { createStyles } from './Card.styles';
import type { CardProps } from './Card.types';

/** Surface block grouping one task. */
function CardBase({ children }: CardProps) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.card}>{children}</View>;
}

export const Card = memo(CardBase);
