import { useCallback } from 'react';
import type { ExerciseRendererProps } from '@/features/content';
import { useLocalizedTexts } from '@/shared/i18n';
import { SingleChoiceList } from '@/shared/ui';
import type { SingleChoiceAnswer, SingleChoicePayload } from '../../model/schemas';

type Props = ExerciseRendererProps<SingleChoicePayload, SingleChoiceAnswer>;

/**
 * Lettered options, `radio` role, in a stable shuffled order per exercise; after reveal the
 * correct option is green, a wrong pick red.
 */
export default function SingleChoiceRenderer({
  exercise,
  answer,
  onAnswerChange,
  revealed,
}: Props) {
  const texts = useLocalizedTexts(exercise.payload.options);
  const handlePick = useCallback((index: number) => onAnswerChange({ index }), [onAnswerChange]);
  return (
    <SingleChoiceList
      orderKey={exercise.id}
      texts={texts}
      picked={answer?.index ?? null}
      correctIndex={exercise.payload.correctIndex}
      revealed={revealed}
      onPick={handlePick}
    />
  );
}
