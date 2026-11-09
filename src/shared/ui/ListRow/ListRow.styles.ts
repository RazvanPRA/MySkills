import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ color, space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    row: {
      minHeight: touchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      padding: space.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.surface,
    },
    texts: { flex: 1, gap: space.xs },
  });
