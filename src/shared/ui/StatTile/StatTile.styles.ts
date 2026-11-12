import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/** Two tiles fit side by side on a small phone; below this width they wrap. */
const TILE_MIN_WIDTH = 140;

export const createStyles = ({ color, space, radius }: Theme) =>
  StyleSheet.create({
    tile: {
      flexGrow: 1,
      flexBasis: TILE_MIN_WIDTH,
      padding: space.lg,
      gap: space.xs,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.surface,
    },
  });
