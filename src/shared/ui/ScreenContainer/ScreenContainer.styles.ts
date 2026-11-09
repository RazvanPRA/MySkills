import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ color, space }: Theme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: color.background },
    content: { padding: space.lg, paddingBottom: space.xxl, gap: space.lg },
  });
