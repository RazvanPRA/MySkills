import { memo, useId } from 'react';
import { TextInput, View } from 'react-native';
import { useTheme, useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { createStyles } from './TextField.styles';
import type { TextFieldProps } from './TextField.types';

function TextFieldBase(props: TextFieldProps) {
  const {
    label,
    value,
    onChangeText,
    help,
    monospace = false,
    multiline = false,
    disabled = false,
  } = props;
  const styles = useThemedStyles(createStyles);
  const { color } = useTheme();
  const labelId = useId();
  return (
    <View style={styles.field}>
      <AppText variant="label" tone="muted" nativeID={labelId}>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityLabelledBy={labelId}
        accessibilityHint={help}
        accessibilityState={{ disabled }}
        editable={!disabled}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        autoCapitalize={monospace ? 'none' : 'sentences'}
        autoCorrect={!monospace}
        placeholderTextColor={color.muted}
        selectionColor={color.accent}
        style={[
          styles.input,
          monospace && styles.monospace,
          multiline && styles.multiline,
          disabled && styles.disabled,
        ]}
      />
      {help ? (
        <AppText variant="caption" tone="muted">
          {help}
        </AppText>
      ) : null}
    </View>
  );
}

export const TextField = memo(TextFieldBase);
