import type { TextProps } from 'react-native';
import type { TypographyVariant } from '@/shared/theme';

export type TextTone = 'default' | 'muted' | 'accent' | 'success' | 'danger';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
  /** Emphasis: weight 600, never another font or italic. */
  bold?: boolean;
};
