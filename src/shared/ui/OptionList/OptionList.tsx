import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { MarkdownText, toPlainText } from '../MarkdownText';
import { OptionRow } from '../OptionRow';
import { createStyles } from './OptionList.styles';
import type { OptionListProps } from './OptionList.types';

/** "A", "B", "C"… for the option at `index`. */
export const optionLetter = (index: number): string => String.fromCharCode(65 + index);

/** Lettered answer options with Markdown labels (single and multiple choice). */
export function OptionList({
  options,
  role,
  onPress,
  disabled = false,
  accessibilityLabel,
}: OptionListProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View
      accessibilityRole={role === 'radio' ? 'radiogroup' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={styles.list}
    >
      {options.map((option, index) => (
        <OptionRow
          key={option.id}
          id={option.id}
          letter={optionLetter(index)}
          label={toPlainText(option.text)}
          state={option.state}
          checked={option.checked}
          role={role}
          onPress={onPress}
          disabled={disabled}
        >
          <MarkdownText content={option.text} bold={option.checked} />
        </OptionRow>
      ))}
    </View>
  );
}
