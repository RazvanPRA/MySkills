import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ color, space, radius }: Theme) =>
  StyleSheet.create({
    tag: {
      alignSelf: 'flex-start',
      paddingVertical: space.xxs,
      paddingHorizontal: space.sm,
      borderRadius: radius.sm,
      backgroundColor: color.background,
    },
  });
