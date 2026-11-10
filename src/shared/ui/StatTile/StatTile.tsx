import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { createStyles } from './StatTile.styles';
import type { StatTileProps } from './StatTile.types';

export const statTileAccessibilityLabel = ({ label, value, caption }: StatTileProps): string =>
  [`${label}: ${value}`, caption].filter(Boolean).join('. ');

/** Label + big value + caption (streak, accuracy). Read by screen readers as one element. */
function StatTileBase(props: StatTileProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.tile} accessible accessibilityLabel={statTileAccessibilityLabel(props)}>
      <AppText variant="label" tone="muted">
        {props.label}
      </AppText>
      <AppText variant="display">{props.value}</AppText>
      {props.caption ? (
        <AppText variant="caption" tone="muted">
          {props.caption}
        </AppText>
      ) : null}
    </View>
  );
}

export const StatTile = memo(StatTileBase);
