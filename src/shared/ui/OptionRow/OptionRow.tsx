import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { useInteractiveStyle } from '../internal/interactiveStyle';
import { createStyles } from './OptionRow.styles';
import type { OptionRowProps } from './OptionRow.types';

/** A lettered answer option (A, B, C…) for single and multiple choice (design system §4.2). */
function OptionRowBase(props: OptionRowProps) {
  const { id, letter, label, state, checked, role, onPress, disabled = false, children } = props;
  const styles = useThemedStyles(createStyles);
  // A revealed verdict (correct / wrong) keeps full contrast; only neutral options are dimmed.
  const dimmed = disabled && (state === 'idle' || state === 'selected');
  const style = useInteractiveStyle([styles.idle, state !== 'idle' && styles[state]], dimmed);
  const handlePress = useCallback(() => onPress(id), [onPress, id]);
  const filled = state === 'correct' || state === 'wrong';
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={`${letter}. ${label}`}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={style}
    >
      <View style={[styles.idleLetter, state !== 'idle' && styles[`${state}Letter`]]}>
        <AppText variant="small" bold style={filled ? styles.filledLetterText : undefined}>
          {letter}
        </AppText>
      </View>
      <View style={styles.label}>{children ?? <AppText bold={checked}>{label}</AppText>}</View>
    </Pressable>
  );
}

export const OptionRow = memo(OptionRowBase);
