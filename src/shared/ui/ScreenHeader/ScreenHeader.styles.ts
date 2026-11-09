import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ space }: Theme) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
    texts: { flex: 1, gap: space.xs },
  });
