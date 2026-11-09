import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

const MULTILINE_MIN_HEIGHT = 96;

export const createStyles = ({ color, space, radius, touchTarget, typography, opacity }: Theme) =>
  StyleSheet.create({
    field: { gap: space.sm },
    input: {
      ...typography.body,
      color: color.text,
      minHeight: touchTarget,
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.surface,
    },
    monospace: { ...typography.code, color: color.text },
    multiline: { minHeight: MULTILINE_MIN_HEIGHT, textAlignVertical: 'top' },
    disabled: { opacity: opacity.disabled },
  });
