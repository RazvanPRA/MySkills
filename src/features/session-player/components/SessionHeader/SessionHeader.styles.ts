import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ space }: Theme) =>
  StyleSheet.create({
    header: { gap: space.sm },
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
    // Pushes the position to the right end of the row.
    position: { marginLeft: 'auto' },
  });
