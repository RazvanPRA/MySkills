import { memo, useCallback } from 'react';
import type { Exercise } from '@/features/content';
import { type EvaluationResult, resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { ActionRow, Button, FeedbackBox, MarkdownText } from '@/shared/ui';
import { verdictOf } from '../../services/verdictOf.service';

type SessionFeedbackProps = {
  exercise: Exercise;
  /** Null for self-graded exercises: their explanation has no verdict. */
  result: EvaluationResult | null;
  onOpenTopic: (topicId: string) => void;
};

/** After reveal: the verdict in words, the explanation, and "Recitește topicul". */
function SessionFeedbackBase({ exercise, result, onOpenTopic }: SessionFeedbackProps) {
  const language = useLanguage();
  const { player } = useStrings();
  const verdict = result ? verdictOf(result, player) : null;
  const openTopic = useCallback(
    () => onOpenTopic(exercise.topicId),
    [onOpenTopic, exercise.topicId],
  );
  return (
    <>
      <FeedbackBox verdict={verdict?.verdict} title={verdict?.title ?? player.explanation}>
        <MarkdownText content={resolveText(exercise.explanation, language).text} variant="small" />
      </FeedbackBox>
      <ActionRow>
        <Button label={player.rereadTopic} variant="secondary" onPress={openTopic} />
      </ActionRow>
    </>
  );
}

export const SessionFeedback = memo(SessionFeedbackBase);
