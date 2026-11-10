import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText, MasteryCell } from '@/shared/ui';
import type { MasteryRowModel } from '../../services/presentMasteryTable';
import { createStyles } from './MasteryTable.styles';

/** One category: name, a cell per level, then the estimated level as text. */
function MasteryTableRowBase({ row }: { row: MasteryRowModel }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <AppText variant="small" style={styles.category}>
        {row.title}
      </AppText>
      {row.cells.map(cell => (
        <MasteryCell
          key={cell.level}
          percent={cell.percent}
          text={cell.text}
          accessibilityLabel={cell.label}
        />
      ))}
      <AppText
        variant="small"
        bold
        style={styles.estimated}
        accessibilityLabel={row.estimatedLabel}
      >
        {row.estimatedText}
      </AppText>
    </View>
  );
}

export const MasteryTableRow = memo(MasteryTableRowBase);
