import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ space }: Theme) => StyleSheet.create({ row: { gap: space.sm } });
