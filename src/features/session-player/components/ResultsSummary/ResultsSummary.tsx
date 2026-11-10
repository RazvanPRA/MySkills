import { memo } from 'react';
import { View } from 'react-native';
import { useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '@/shared/ui';
import type { SessionSummary } from '../../services/summarizeSession.service';
import { createStyles } from './ResultsSummary.styles';

/** Label → big percentage → "8 din 10 corecte" → verdict sentence (design system §6.3). */
function ResultsSummaryBase({ summary }: { summary: SessionSummary }) {
  const styles = useThemedStyles(createStyles);
  const { results } = useStrings();
  return (
    <View style={styles.summary} accessibilityLiveRegion="polite">
      <AppText variant="label" tone="muted">
        {results.label}
      </AppText>
      <AppText variant="display" accessibilityRole="header">
        {`${summary.percent}%`}
      </AppText>
      <AppText tone="muted">{results.correctOf(summary.correct, summary.total)}</AppText>
      <AppText bold>{results.verdicts[summary.verdict]}</AppText>
    </View>
  );
}

export const ResultsSummary = memo(ResultsSummaryBase);
