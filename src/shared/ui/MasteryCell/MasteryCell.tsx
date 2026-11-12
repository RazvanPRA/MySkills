import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { masteryStep, useTheme, useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { createStyles } from './MasteryCell.styles';
import type { MasteryCellProps } from './MasteryCell.types';

/**
 * One heatmap cell (design system §2.3): the percentage as text on the mastery step's fill.
 * The color only reinforces the number; mastery colors are used nowhere else.
 */
function MasteryCellBase({ percent, text, accessibilityLabel }: MasteryCellProps) {
  const styles = useThemedStyles(createStyles);
  const { mastery } = useTheme();
  const step = masteryStep(percent);
  // Dynamic per value: the only inline styles the design system allows.
  const fill = useMemo(() => ({ backgroundColor: mastery.fill[step] }), [mastery, step]);
  const ink = useMemo(() => ({ color: mastery.text[step] }), [mastery, step]);
  return (
    <View style={[styles.cell, fill]} accessible accessibilityLabel={accessibilityLabel}>
      <AppText variant="small" bold style={ink}>
        {text}
      </AppText>
    </View>
  );
}

export const MasteryCell = memo(MasteryCellBase);
