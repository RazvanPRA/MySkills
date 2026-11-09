import { useCallback } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { Segment } from './Segment';
import { createStyles } from './SegmentedControl.styles';
import type { SegmentedControlProps } from './SegmentedControl.types';

/** Pick exactly one of 2–4 short options. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
}: SegmentedControlProps<T>) {
  const styles = useThemedStyles(createStyles);
  // Segments report plain strings; every id comes from `options`, so the cast is safe.
  const handlePress = useCallback((id: string) => onChange(id as T), [onChange]);
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={styles.group}
    >
      {options.map(option => (
        <Segment
          key={option.id}
          id={option.id}
          label={option.label}
          active={option.id === value}
          disabled={disabled}
          onPress={handlePress}
        />
      ))}
    </View>
  );
}
