import { memo } from 'react';
import { Text } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { createStyles } from './AppText.styles';
import type { AppTextProps } from './AppText.types';

/** The only text component used outside this primitive layer. */
function AppTextBase({
  variant = 'body',
  tone = 'default',
  bold = false,
  style,
  ...rest
}: AppTextProps) {
  const styles = useThemedStyles(createStyles);
  return <Text {...rest} style={[styles[variant], styles[tone], bold && styles.bold, style]} />;
}

export const AppText = memo(AppTextBase);
