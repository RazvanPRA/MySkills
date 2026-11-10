import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '../AppText';
import { useInteractiveStyle } from '../internal/interactiveStyle';
import type { CodeBlockStyles } from './CodeBlock.styles';
import type { CodeLineSelection, CodeLineState } from './CodeBlock.types';
import type { CodeLine } from './highlightCode';

type CodeLineContentProps = {
  line: CodeLine;
  /** 1-based; omitted when line numbers are hidden. */
  number?: number;
  state?: CodeLineState;
  styles: CodeBlockStyles;
};

/** Gutter + colored spans. A line with a state is plain and bold, so it stays readable. */
function CodeLineContent({ line, number, state = 'idle', styles }: CodeLineContentProps) {
  const marked = state !== 'idle';
  return (
    <>
      {number === undefined ? null : (
        <AppText variant="code" style={styles.gutter} importantForAccessibility="no">
          {number}
        </AppText>
      )}
      <AppText variant="code" style={marked ? styles.markedText : styles.plain}>
        {line.map((span, index) => (
          <AppText key={index} variant="code" style={marked ? undefined : styles[span.role]}>
            {span.text}
          </AppText>
        ))}
      </AppText>
    </>
  );
}

type CodeLineRowProps = Omit<CodeLineContentProps, 'state'>;

/** One read-only line of code. Never wraps (the block scrolls). */
function CodeLineRowBase(props: CodeLineRowProps) {
  return (
    <View style={props.styles.line}>
      <CodeLineContent {...props} />
    </View>
  );
}

export const CodeLineRow = memo(CodeLineRowBase);

type SelectableCodeLineProps = {
  line: CodeLine;
  number: number;
  selection: CodeLineSelection;
  styles: CodeBlockStyles;
};

/** A pressable line (find_bug): a `button` named "Linia N: …", with its selected state. */
function SelectableCodeLineBase({ line, number, selection, styles }: SelectableCodeLineProps) {
  const { states, onSelectLine, lineLabel, disabled = false } = selection;
  const state = states[number - 1] ?? 'idle';
  // After reveal only neutral lines are dimmed; a verdict keeps full contrast.
  const style = useInteractiveStyle(
    [styles.line, styles.selectableLine, state !== 'idle' && styles[state]],
    disabled && state === 'idle',
  );
  const handlePress = useCallback(() => onSelectLine(number), [onSelectLine, number]);
  const text = line
    .map(span => span.text)
    .join('')
    .trim();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={lineLabel(number, text)}
      accessibilityState={{ selected: state === 'selected', disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={style}
    >
      <CodeLineContent line={line} number={number} state={state} styles={styles} />
    </Pressable>
  );
}

export const SelectableCodeLine = memo(SelectableCodeLineBase);
