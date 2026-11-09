import { memo } from 'react';
import { Pressable } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { useInteractiveStyle } from '../internal/interactiveStyle';
import { createStyles } from './Button.styles';
import type { ButtonProps } from './Button.types';

function ButtonBase({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
}: ButtonProps) {
  const styles = useThemedStyles(createStyles);
  const style = useInteractiveStyle([styles.base, styles[variant]], disabled);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={style}
    >
      <AppText bold style={styles[`${variant}Label`]}>
        {label}
      </AppText>
    </Pressable>
  );
}

export const Button = memo(ButtonBase);
