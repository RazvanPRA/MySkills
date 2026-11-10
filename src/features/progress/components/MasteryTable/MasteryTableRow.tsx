import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText, MasteryCell } from '@/shared/ui';
import type { MasteryRowModel } from '../../services/presentMasteryTable';
import { createStyles } from './MasteryTable.styles';

/** One category: name with its estimated level as text, then a cell per level. */
function MasteryTableRowBase({ row }: { row: MasteryRowModel }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <View style={styles.category}>
        <AppText variant="small">{row.title}</AppText>
        <AppText variant="caption" bold accessibilityLabel={row.estimatedLabel}>
          {row.estimatedText}
        </AppText>
      </View>
      {row.cells.map(cell => (
        <MasteryCell
          key={cell.level}
          percent={cell.percent}
          text={cell.text}
          accessibilityLabel={cell.label}
        />
      ))}
    </View>
  );
}

export const MasteryTableRow = memo(MasteryTableRowBase);
