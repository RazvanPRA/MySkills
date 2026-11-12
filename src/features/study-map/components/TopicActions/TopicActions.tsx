import { useCallback } from 'react';
import { useStrings } from '@/shared/i18n';
import { ActionRow, AppText, Button } from '@/shared/ui';

/** Starting a practice session is wired by the app (study-map does not know test types). */
export type TopicPractice = {
  onPress: (topicId: string) => void;
  busy: boolean;
  failed: boolean;
};

type TopicActionsProps = {
  topicId: string;
  exerciseCount: number;
  practice?: TopicPractice;
  onBack: () => void;
};

/** Back (secondary, left) · "Exersează topicul" (primary, right), design system §6.3. */
export function TopicActions({ topicId, exerciseCount, practice, onBack }: TopicActionsProps) {
  const { topic: strings } = useStrings();
  const onPractice = practice?.onPress;
  const start = useCallback(() => onPractice?.(topicId), [onPractice, topicId]);
  const note =
    exerciseCount === 0 ? strings.noExercises : practice?.failed ? strings.practiceError : null;
  return (
    <>
      {practice && note ? (
        <AppText variant="small" tone="muted">
          {note}
        </AppText>
      ) : null}
      <ActionRow>
        <Button label={strings.back} variant="secondary" onPress={onBack} />
        {practice ? (
          <Button
            label={strings.practice}
            onPress={start}
            disabled={exerciseCount === 0 || practice.busy}
          />
        ) : null}
      </ActionRow>
    </>
  );
}
