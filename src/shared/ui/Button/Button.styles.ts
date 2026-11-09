import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ color, space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: touchTarget,
      minWidth: touchTarget,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: color.accent, borderColor: color.accent },
    secondary: { backgroundColor: color.surface, borderColor: color.border },
    primaryLabel: { color: color.onAccent, textAlign: 'center' },
    secondaryLabel: { color: color.text, textAlign: 'center' },
  });
