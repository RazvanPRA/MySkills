import { ScrollView, View } from 'react-native';
import { levels } from '@/shared/domain';
import { useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '@/shared/ui';
import type { MasteryRowModel } from '../../services/presentMasteryTable';
import { createStyles } from './MasteryTable.styles';
import { MasteryTableRow } from './MasteryTableRow';

/** Column titles. Hidden from screen readers: every cell's label already names its column. */
function MasteryTableHeader() {
  const styles = useThemedStyles(createStyles);
  const { progress, levels: levelNames } = useStrings();
  return (
    <View style={[styles.row, styles.header]} importantForAccessibility="no-hide-descendants">
      <AppText variant="label" style={styles.category}>
        {progress.matrix.category}
      </AppText>
      {levels.map(level => (
        <AppText key={level} variant="label" style={styles.level}>
          {levelNames[level]}
        </AppText>
      ))}
      <AppText variant="label" style={styles.estimated}>
        {progress.matrix.estimated}
      </AppText>
    </View>
  );
}

/**
 * Categories × levels (design system §6.3): a bordered frame that scrolls horizontally, with
 * an accentSoft header. Same structure as the competency matrix.
 */
export function MasteryTable({ rows }: { rows: readonly MasteryRowModel[] }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.frame}>
      <ScrollView horizontal>
        <View>
          <MasteryTableHeader />
          {rows.map(row => (
            <MasteryTableRow key={row.categoryId} row={row} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
