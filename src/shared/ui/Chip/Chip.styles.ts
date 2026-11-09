import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ color, space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: touchTarget,
      minWidth: touchTarget,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selected: { borderColor: color.accent, backgroundColor: color.accentSoft },
  });
