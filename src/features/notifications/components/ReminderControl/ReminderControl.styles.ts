import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ space }: Theme) =>
  StyleSheet.create({
    group: { gap: space.md },
    stepper: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.md },
  });
