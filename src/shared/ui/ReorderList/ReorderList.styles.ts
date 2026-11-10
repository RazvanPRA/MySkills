import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/** Size of the square position badge (same as the option letter, design system §2.7). */
const POSITION_SIZE = 26;

export const createStyles = ({ color, space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    list: { gap: space.sm },
    idle: {
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
    correct: { borderColor: color.success, backgroundColor: color.successSoft },
    wrong: { borderColor: color.danger, backgroundColor: color.dangerSoft },
    position: {
      width: POSITION_SIZE,
      height: POSITION_SIZE,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: space.xs },
    moves: { flexDirection: 'row', gap: space.xs },
    move: {
      minWidth: touchTarget,
      minHeight: touchTarget,
      paddingHorizontal: space.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.surface,
    },
  });

export type ReorderListStyles = ReturnType<typeof createStyles>;
