import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/** The only border wider than 1 px in the design system (§2.7). */
const VERDICT_BAR_WIDTH = 3;

export const createStyles = ({ color, space, radius }: Theme) =>
  StyleSheet.create({
    neutral: {
      gap: space.sm,
      padding: space.md,
      borderRadius: radius.md,
      backgroundColor: color.background,
      borderLeftWidth: VERDICT_BAR_WIDTH,
      borderLeftColor: color.border,
    },
    correct: { borderLeftColor: color.success },
    wrong: { borderLeftColor: color.danger },
    partial: { borderLeftColor: color.danger },
  });
