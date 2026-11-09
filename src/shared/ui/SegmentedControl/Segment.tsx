import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { useInteractiveStyle } from '../internal/interactiveStyle';
import { createStyles } from './SegmentedControl.styles';

type SegmentProps = {
  id: string;
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: (id: string) => void;
};

/** One radio inside SegmentedControl. Private to this primitive. */
function SegmentBase({ id, label, active, disabled, onPress }: SegmentProps) {
  const styles = useThemedStyles(createStyles);
  const style = useInteractiveStyle([styles.segment, active && styles.active], disabled);
  const handlePress = useCallback(() => onPress(id), [onPress, id]);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active, checked: active, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={style}
    >
      <AppText variant="small" bold={active} style={active ? styles.activeLabel : styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

export const Segment = memo(SegmentBase);
