import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import type { ExerciseRendererProps } from '@/features/content';
import { useLocalizedTexts, useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText, OptionList, useOrderedOptionItems } from '@/shared/ui';
import type { MultipleChoiceAnswer, MultipleChoicePayload } from '../../model/schemas';
import { togglePick } from '../../services/evaluateMultipleChoice.service';
import { createStyles } from './MultipleChoiceRenderer.styles';

type Props = ExerciseRendererProps<MultipleChoicePayload, MultipleChoiceAnswer>;

/** "Alege N" hint + checkbox options in a stable shuffled order; after reveal each shows its state. */
export default function MultipleChoiceRenderer(props: Props) {
  const { exercise, answer, onAnswerChange, revealed } = props;
  const styles = useThemedStyles(createStyles);
  const { exercise: strings } = useStrings();
  const { options, correctIndices } = exercise.payload;
  const texts = useLocalizedTexts(options);
  const picked = useMemo(() => answer?.indices ?? [], [answer]);
  const items = useOrderedOptionItems({
    orderKey: exercise.id,
    texts,
    picked,
    correct: correctIndices,
    revealed,
  });
  const handlePress = useCallback(
    (id: string) => onAnswerChange({ indices: togglePick(picked, Number(id)) }),
    [onAnswerChange, picked],
  );
  const hint = strings.chooseCount(correctIndices.length);
  return (
    <View style={styles.area}>
      <AppText tone="accent" bold>
        {hint}
      </AppText>
      <OptionList
        options={items}
        role="checkbox"
        onPress={handlePress}
        disabled={revealed}
        accessibilityLabel={hint}
      />
    </View>
  );
}
