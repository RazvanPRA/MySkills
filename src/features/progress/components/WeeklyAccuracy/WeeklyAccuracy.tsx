import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText, ProgressBar } from '@/shared/ui';
import type { WeekModel } from '../../services/presentProgressLists';
import { createStyles } from './WeeklyAccuracy.styles';

/** Accuracy per week: label, bar and the value written as text. */
export function WeeklyAccuracy({ weeks }: { weeks: readonly WeekModel[] }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.list}>
      {weeks.map(week => (
        <View key={week.weekStart} style={styles.week}>
          <AppText variant="small">{week.title}</AppText>
          <ProgressBar
            progress={week.progress}
            accessibilityLabel={`${week.title}: ${week.text}`}
          />
          <AppText variant="caption" tone="muted">
            {week.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}
