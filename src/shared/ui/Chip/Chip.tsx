import { memo, useCallback } from 'react';
import { type AccessibilityState, Pressable } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { useInteractiveStyle } from '../internal/interactiveStyle';
import { createStyles } from './Chip.styles';
import type { ChipProps, ChipRole } from './Chip.types';

const a11yState = (role: ChipRole, selected: boolean, disabled: boolean): AccessibilityState =>
  role === 'checkbox' ? { checked: selected, disabled } : { selected, disabled };

function ChipBase({ id, label, selected, onPress, role, disabled = false }: ChipProps) {
  const styles = useThemedStyles(createStyles);
  const style = useInteractiveStyle([styles.base, selected && styles.selected], disabled);
  const handlePress = useCallback(() => onPress(id), [onPress, id]);
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={a11yState(role, selected, disabled)}
      disabled={disabled}
      onPress={handlePress}
      style={style}
    >
      <AppText variant="small" bold={selected}>
        {label}
      </AppText>
    </Pressable>
  );
}

export const Chip = memo(ChipBase);
