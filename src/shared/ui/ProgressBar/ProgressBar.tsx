import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { createStyles } from './ProgressBar.styles';
import type { ProgressBarProps } from './ProgressBar.types';
import { toPercent } from './toPercent';

function ProgressBarBase({
  progress,
  tone = 'accent',
  thick = false,
  accessibilityLabel,
}: ProgressBarProps) {
  const styles = useThemedStyles(createStyles);
  const percent = toPercent(progress);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, thick && styles.thick]}
    >
      {/* Dynamic width is the one inline style the design system allows. */}
      <View style={[styles.fill, styles[tone], { width: `${percent}%` }]} />
    </View>
  );
}

export const ProgressBar = memo(ProgressBarBase);
