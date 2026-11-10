import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ space }: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: space.sm },
  });
