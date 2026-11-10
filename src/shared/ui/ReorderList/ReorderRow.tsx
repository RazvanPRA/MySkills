import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '../AppText';
import { useInteractiveStyle } from '../internal/interactiveStyle';
import { MarkdownText, toPlainText } from '../MarkdownText';
import type { ReorderListStyles } from './ReorderList.styles';
import type { ReorderDirection, ReorderListItem, ReorderListLabels } from './ReorderList.types';

type MoveButtonProps = {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
  styles: ReorderListStyles;
};

function MoveButton({ label, accessibilityLabel, disabled, onPress, styles }: MoveButtonProps) {
  const style = useInteractiveStyle(styles.move, disabled);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={style}
    >
      <AppText variant="small" bold>
        {label}
      </AppText>
    </Pressable>
  );
}

type ReorderRowProps = {
  item: ReorderListItem;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: string, direction: ReorderDirection) => void;
  labels: ReorderListLabels;
  disabled: boolean;
  styles: ReorderListStyles;
};

/** One item: position badge, Markdown text (+ caption), "Sus" / "Jos" buttons. */
function ReorderRowBase(props: ReorderRowProps) {
  const { item, position, isFirst, isLast, onMove, labels, disabled, styles } = props;
  const { id, text, state = 'idle', caption } = item;
  const plain = toPlainText(text);
  const moveUp = useCallback(() => onMove(id, 'up'), [onMove, id]);
  const moveDown = useCallback(() => onMove(id, 'down'), [onMove, id]);
  return (
    <View testID={`reorder-item-${id}`} style={[styles.idle, state !== 'idle' && styles[state]]}>
      <View style={styles.position}>
        <AppText variant="small" bold>
          {position}
        </AppText>
      </View>
      <View style={styles.body}>
        <MarkdownText content={text} />
        {caption ? (
          <AppText variant="small" bold>
            {caption}
          </AppText>
        ) : null}
      </View>
      <View style={styles.moves}>
        <MoveButton
          label={labels.up}
          accessibilityLabel={labels.moveUp(plain)}
          disabled={disabled || isFirst}
          onPress={moveUp}
          styles={styles}
        />
        <MoveButton
          label={labels.down}
          accessibilityLabel={labels.moveDown(plain)}
          disabled={disabled || isLast}
          onPress={moveDown}
          styles={styles}
        />
      </View>
    </View>
  );
}

export const ReorderRow = memo(ReorderRowBase);
