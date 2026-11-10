import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';
import { MASTERY_CELL_WIDTH } from '@/shared/ui';

/** Category names wrap inside this column; the table scrolls horizontally when needed. */
const CATEGORY_COLUMN_WIDTH = 132;
const ESTIMATED_COLUMN_WIDTH = 96;

export const createStyles = ({ color, space, radius }: Theme) =>
  StyleSheet.create({
    frame: {
      borderWidth: 1,
      borderColor: color.border,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      padding: space.xs,
      borderTopWidth: 1,
      borderTopColor: color.border,
    },
    header: { backgroundColor: color.accentSoft, borderTopWidth: 0 },
    category: { width: CATEGORY_COLUMN_WIDTH, paddingHorizontal: space.xs },
    level: { width: MASTERY_CELL_WIDTH, textAlign: 'center' },
    estimated: { width: ESTIMATED_COLUMN_WIDTH, paddingHorizontal: space.xs },
  });
