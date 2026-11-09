import {
  type PressableStateCallbackType,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { type Theme, useThemedStyles } from '@/shared/theme';

const createStyles = ({ opacity }: Theme) =>
  StyleSheet.create({
    pressed: { opacity: opacity.pressed },
    disabled: { opacity: opacity.disabled },
  });

type PressableStyle = (state: PressableStateCallbackType) => StyleProp<ViewStyle>;

/**
 * Shared pressed (0.8) / disabled (0.45) states for every pressable primitive (design system §5).
 * Returns a `style` callback for `Pressable`.
 */
export function useInteractiveStyle(base: StyleProp<ViewStyle>, disabled = false): PressableStyle {
  const styles = useThemedStyles(createStyles);
  return ({ pressed }) => [
    base,
    pressed && !disabled && styles.pressed,
    disabled && styles.disabled,
  ];
}
