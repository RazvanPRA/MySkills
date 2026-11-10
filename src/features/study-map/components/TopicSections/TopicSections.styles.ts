import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

export const createStyles = ({ space }: Theme) =>
  StyleSheet.create({
    sections: { gap: space.xl },
    section: { gap: space.sm },
  });
