import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';
import { MASTERY_CELL_WIDTH } from '@/shared/ui';

/**
 * Category name and estimated level wrap inside this column. With three level cells the table
 * fits a 400 dp wide phone; narrower screens scroll horizontally.
 */
const CATEGORY_COLUMN_WIDTH = 132;

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
    // Rows stretch to the frame when the table is narrower than the screen.
    content: { flexGrow: 1 },
    header: { backgroundColor: color.accentSoft, borderTopWidth: 0 },
    category: { width: CATEGORY_COLUMN_WIDTH, paddingHorizontal: space.xs, gap: space.xxs },
    level: { width: MASTERY_CELL_WIDTH, textAlign: 'center' },
  });
