import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import type { ExerciseRendererProps } from '@/features/content';
import { useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText, CodeBlock, type CodeLineSelection } from '@/shared/ui';
import { codeLineCount, type FindBugAnswer, type FindBugPayload } from '../../model/schemas';
import { bugLineStates } from '../../services/evaluateFindBug.service';
import { createStyles } from './FindBugRenderer.styles';

type Props = ExerciseRendererProps<FindBugPayload, FindBugAnswer>;

/**
 * find_bug (design system §6.2): "Atinge linia cu bug-ul" + a CodeBlock with selectable lines.
 * After reveal the bug line is green, a wrong pick red, and the bug line is named as text.
 */
export default function FindBugRenderer({ exercise, answer, onAnswerChange, revealed }: Props) {
  const styles = useThemedStyles(createStyles);
  const { exercise: strings } = useStrings();
  const { code, language, bugLines } = exercise.payload;
  const picked = answer?.line ?? null;
  const handleSelect = useCallback((line: number) => onAnswerChange({ line }), [onAnswerChange]);
  const selection = useMemo<CodeLineSelection>(
    () => ({
      states: bugLineStates({ lineCount: codeLineCount(code), bugLines, picked, revealed }),
      onSelectLine: handleSelect,
      lineLabel: strings.lineLabel,
      disabled: revealed,
    }),
    [code, bugLines, picked, revealed, handleSelect, strings],
  );
  // One bug line in almost every exercise; several are listed.
  const [onlyLine] = bugLines;
  const bugText =
    bugLines.length === 1 && onlyLine !== undefined
      ? strings.bugLine(onlyLine)
      : strings.bugLines(bugLines.join(', '));
  return (
    <View style={styles.area}>
      <AppText tone="accent" bold>
        {strings.findBugHint}
      </AppText>
      <CodeBlock code={code} language={language} selection={selection} />
      {revealed ? <AppText bold>{bugText}</AppText> : null}
    </View>
  );
}
