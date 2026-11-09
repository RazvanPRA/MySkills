import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { useInteractiveStyle } from '../internal/interactiveStyle';
import { createStyles } from './ListRow.styles';
import type { ListRowProps } from './ListRow.types';

export const rowAccessibilityLabel = (title: string, meta?: string): string =>
  meta ? `${title}, ${meta}` : title;

function ListRowBase({ title, meta, accessory, onPress, disabled = false }: ListRowProps) {
  const styles = useThemedStyles(createStyles);
  const style = useInteractiveStyle(styles.row, disabled);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rowAccessibilityLabel(title, meta)}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={style}
    >
      <View style={styles.texts}>
        <AppText>{title}</AppText>
        {meta ? (
          <AppText variant="small" tone="muted">
            {meta}
          </AppText>
        ) : null}
      </View>
      {accessory}
    </Pressable>
  );
}

export const ListRow = memo(ListRowBase);
