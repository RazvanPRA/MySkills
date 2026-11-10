import { useCallback } from 'react';
import { View } from 'react-native';
import type { Exercise, ExerciseRendererProps } from '@/features/content';
import { useLocalizedTexts, useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText, CodeBlock, SingleChoiceList, TextField } from '@/shared/ui';
import type { CodeOutputAnswer, CodeOutputPayload } from '../../model/schemas';
import { createStyles } from './CodeOutputRenderer.styles';

type Props = ExerciseRendererProps<CodeOutputPayload, CodeOutputAnswer>;
type ModeProps<TPayload> = Omit<Props, 'exercise' | 'result'> & { exercise: Exercise<TPayload> };
type ChoicePayload = Extract<CodeOutputPayload, { mode: 'choice' }>;
type InputPayload = Extract<CodeOutputPayload, { mode: 'input' }>;

/** Choice mode: lettered options in a stable shuffled order (like single choice). */
function OutputChoices({ exercise, answer, onAnswerChange, revealed }: ModeProps<ChoicePayload>) {
  const texts = useLocalizedTexts(exercise.payload.options);
  const handlePick = useCallback((index: number) => onAnswerChange({ index }), [onAnswerChange]);
  return (
    <SingleChoiceList
      orderKey={exercise.id}
      texts={texts}
      picked={answer && 'index' in answer ? answer.index : null}
      correctIndex={exercise.payload.correctIndex}
      revealed={revealed}
      onPick={handlePick}
    />
  );
}

/** Input mode: a monospace field; after reveal the exact output in a CodeBlock. */
function OutputInput({ exercise, answer, onAnswerChange, revealed }: ModeProps<InputPayload>) {
  const styles = useThemedStyles(createStyles);
  const { exercise: strings } = useStrings();
  const handleChange = useCallback((text: string) => onAnswerChange({ text }), [onAnswerChange]);
  return (
    <View style={styles.area}>
      <TextField
        label={strings.outputLabel}
        help={strings.outputHelp}
        value={answer && 'text' in answer ? answer.text : ''}
        onChangeText={handleChange}
        monospace
        multiline
        disabled={revealed}
      />
      {revealed ? (
        <View style={styles.expected}>
          <AppText variant="label" tone="muted">
            {strings.expectedOutput}
          </AppText>
          <CodeBlock code={exercise.payload.expected} />
        </View>
      ) : null}
    </View>
  );
}

/** code_output (design system §6.2): the code is in the prompt; the output is picked or typed. */
export default function CodeOutputRenderer({ exercise, answer, onAnswerChange, revealed }: Props) {
  const { payload } = exercise;
  const shared = { answer, onAnswerChange, revealed };
  return payload.mode === 'choice' ? (
    <OutputChoices exercise={{ ...exercise, payload }} {...shared} />
  ) : (
    <OutputInput exercise={{ ...exercise, payload }} {...shared} />
  );
}
