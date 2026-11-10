import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { createStyles } from './ReorderList.styles';
import type { ReorderListProps } from './ReorderList.types';
import { ReorderRow } from './ReorderRow';

/**
 * Orders items with "Sus" / "Jos" buttons and position numbers (design system §4.2):
 * no drag, so it works with TalkBack, large fonts and one hand.
 */
export function ReorderList({
  items,
  onMove,
  labels,
  disabled = false,
  accessibilityLabel,
}: ReorderListProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View accessibilityRole="list" accessibilityLabel={accessibilityLabel} style={styles.list}>
      {items.map((item, index) => (
        <ReorderRow
          key={item.id}
          item={item}
          position={index + 1}
          isFirst={index === 0}
          isLast={index === items.length - 1}
          onMove={onMove}
          labels={labels}
          disabled={disabled}
          styles={styles}
        />
      ))}
    </View>
  );
}
