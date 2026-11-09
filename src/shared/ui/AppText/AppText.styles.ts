import { StyleSheet } from 'react-native';
import { boldWeight, type Theme } from '@/shared/theme';

export const createStyles = ({ color, typography }: Theme) =>
  StyleSheet.create({
    // Variants
    display: typography.display,
    title: typography.title,
    body: typography.body,
    small: typography.small,
    caption: typography.caption,
    label: typography.label,
    code: typography.code,
    // Tones
    default: { color: color.text },
    muted: { color: color.muted },
    accent: { color: color.accent },
    success: { color: color.success },
    danger: { color: color.danger },
    bold: { fontWeight: boldWeight },
  });
