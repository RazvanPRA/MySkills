import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

const TRACK_HEIGHT = 4;
const TRACK_HEIGHT_THICK = 8;

export const createStyles = ({ color, radius }: Theme) =>
  StyleSheet.create({
    track: {
      height: TRACK_HEIGHT,
      borderRadius: radius.sm,
      backgroundColor: color.border,
      overflow: 'hidden',
    },
    thick: { height: TRACK_HEIGHT_THICK },
    fill: { height: '100%', borderRadius: radius.sm },
    accent: { backgroundColor: color.accent },
    success: { backgroundColor: color.success },
    danger: { backgroundColor: color.danger },
  });
