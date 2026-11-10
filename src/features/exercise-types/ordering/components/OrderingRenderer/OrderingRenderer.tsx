import { useMemo } from 'react';
import { View } from 'react-native';
import type { ExerciseRendererProps } from '@/features/content';
import { useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText, ReorderList, type ReorderListLabels } from '@/shared/ui';
import type { OrderingAnswer, OrderingPayload } from '../../model/schemas';
import { createStyles } from './OrderingRenderer.styles';
import { useOrderingItems } from './useOrderingItems';

type Props = ExerciseRendererProps<OrderingPayload, OrderingAnswer>;

/**
 * ordering (design system §6.2): items start shuffled and move with "Sus" / "Jos". After
 * reveal each item is green in place or red with "Poziția corectă: N".
 */
export default function OrderingRenderer({ exercise, answer, onAnswerChange, revealed }: Props) {
  const styles = useThemedStyles(createStyles);
  const { exercise: strings } = useStrings();
  const { items, handleMove } = useOrderingItems({ exercise, answer, onAnswerChange, revealed });
  const labels = useMemo<ReorderListLabels>(
    () => ({
      up: strings.moveUp,
      down: strings.moveDown,
      moveUp: strings.moveUpLabel,
      moveDown: strings.moveDownLabel,
    }),
    [strings],
  );
  return (
    <View style={styles.area}>
      <AppText tone="accent" bold>
        {strings.orderingHint}
      </AppText>
      <ReorderList
        items={items}
        onMove={handleMove}
        labels={labels}
        disabled={revealed}
        accessibilityLabel={strings.orderingHint}
      />
    </View>
  );
}
