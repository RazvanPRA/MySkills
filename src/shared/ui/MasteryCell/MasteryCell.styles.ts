import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/** Wide enough for "100%" at the largest font scale the table still scrolls for. */
export const MASTERY_CELL_WIDTH = 72;

export const createStyles = ({ space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    cell: {
      width: MASTERY_CELL_WIDTH,
      minHeight: touchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space.xs,
      borderRadius: radius.sm,
    },
  });
