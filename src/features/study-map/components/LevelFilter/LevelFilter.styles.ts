import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ space }: Theme) =>
  StyleSheet.create({
    group: { gap: space.sm },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  });
