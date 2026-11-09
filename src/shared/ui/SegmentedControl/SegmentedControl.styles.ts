import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ color, space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    group: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space.xs,
      padding: space.xxs,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.surface,
    },
    segment: {
      flexGrow: 1,
      minHeight: touchTarget,
      minWidth: touchTarget,
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Active segment is inverted: `text` fill with a `background` label.
    active: { backgroundColor: color.text },
    activeLabel: { color: color.background, textAlign: 'center' },
    label: { textAlign: 'center' },
  });
