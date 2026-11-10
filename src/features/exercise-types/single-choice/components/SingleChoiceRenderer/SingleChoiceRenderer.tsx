import { useCallback, useMemo } from 'react';
import type { ExerciseRendererProps } from '@/features/content';
import { resolveText } from '@/shared/domain';
import { useLanguage } from '@/shared/i18n';
import { buildOptionItems, OptionList } from '@/shared/ui';
import type { SingleChoiceAnswer, SingleChoicePayload } from '../../model/schemas';

type Props = ExerciseRendererProps<SingleChoicePayload, SingleChoiceAnswer>;

/** Lettered options, `radio` role; after reveal the correct option is green, a wrong pick red. */
export default function SingleChoiceRenderer({
  exercise,
  answer,
  onAnswerChange,
  revealed,
}: Props) {
  const language = useLanguage();
  const { options, correctIndex } = exercise.payload;
  const items = useMemo(
    () =>
      buildOptionItems({
        texts: options.map(option => resolveText(option, language).text),
        picked: new Set(answer ? [answer.index] : []),
        correct: new Set([correctIndex]),
        revealed,
      }),
    [options, correctIndex, answer, revealed, language],
  );
  const handlePress = useCallback(
    (id: string) => onAnswerChange({ index: Number(id) }),
    [onAnswerChange],
  );
  return <OptionList options={items} role="radio" onPress={handlePress} disabled={revealed} />;
}
