import { Suspense } from 'react';
import { View } from 'react-native';
import type { Exercise, ExerciseTypeDefinition } from '@/features/content';
import { type EvaluationResult, resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText, MarkdownText } from '@/shared/ui';
import { createStyles } from './ExerciseView.styles';

type ExerciseViewProps = {
  exercise: Exercise;
  definition: ExerciseTypeDefinition;
  answer: unknown;
  onAnswerChange: (answer: unknown) => void;
  revealed: boolean;
  result: EvaluationResult | null;
};

/**
 * The question (Markdown, may contain code) and the answer area rendered by the exercise
 * type's Renderer from the registry: the player never switches on the exercise type.
 */
export function ExerciseView({
  exercise,
  definition,
  answer,
  onAnswerChange,
  revealed,
  result,
}: ExerciseViewProps) {
  const styles = useThemedStyles(createStyles);
  const language = useLanguage();
  const { player } = useStrings();
  const prompt = resolveText(exercise.prompt, language);
  const { Renderer } = definition;
  return (
    <View style={styles.view}>
      <MarkdownText content={prompt.text} variant="title" />
      {prompt.isFallback ? (
        <AppText variant="caption" tone="muted">
          {player.onlyRomanian}
        </AppText>
      ) : null}
      <Suspense fallback={null}>
        <Renderer
          exercise={exercise}
          answer={answer}
          onAnswerChange={onAnswerChange}
          revealed={revealed}
          result={result}
        />
      </Suspense>
    </View>
  );
}
