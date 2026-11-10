import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import type { ExerciseRendererProps } from '@/features/content';
import { resolveText, type ReviewRating, reviewRatings } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText, FeedbackBox, MarkdownText, SegmentedControl } from '@/shared/ui';
import type { FlashcardAnswer, FlashcardPayload } from '../../model/schemas';
import { createStyles } from './FlashcardRenderer.styles';

type Props = ExerciseRendererProps<FlashcardPayload, FlashcardAnswer>;

/**
 * Before reveal: only a hint (the player shows "Arată răspunsul"). After reveal: the model
 * answer without a verdict, key points, and a neutral self-rating (design system §6.2).
 */
export default function FlashcardRenderer({ exercise, answer, onAnswerChange, revealed }: Props) {
  const styles = useThemedStyles(createStyles);
  const language = useLanguage();
  const { exercise: strings } = useStrings();
  const { answer: modelAnswer, keyPoints } = exercise.payload;
  const keyPointsMarkdown = useMemo(
    () => keyPoints.map(point => `- ${resolveText(point, language).text}`).join('\n'),
    [keyPoints, language],
  );
  const ratingOptions = useMemo(
    () => reviewRatings.map(rating => ({ id: String(rating), label: strings.ratings[rating] })),
    [strings],
  );
  const handleRate = useCallback(
    (id: string) => onAnswerChange({ rating: Number(id) as ReviewRating }),
    [onAnswerChange],
  );

  if (!revealed) {
    return <AppText tone="muted">{strings.flashcardHint}</AppText>;
  }
  return (
    <View style={styles.area}>
      <FeedbackBox title={strings.modelAnswer}>
        <MarkdownText content={resolveText(modelAnswer, language).text} variant="small" />
        {keyPoints.length > 0 ? (
          <>
            <AppText variant="label" tone="muted">
              {strings.keyPoints}
            </AppText>
            <MarkdownText content={keyPointsMarkdown} variant="small" />
          </>
        ) : null}
      </FeedbackBox>
      <View style={styles.rating}>
        <AppText variant="label" tone="muted">
          {strings.rateLabel}
        </AppText>
        <SegmentedControl
          options={ratingOptions}
          value={answer ? String(answer.rating) : null}
          onChange={handleRate}
          accessibilityLabel={strings.rateLabel}
        />
      </View>
    </View>
  );
}
