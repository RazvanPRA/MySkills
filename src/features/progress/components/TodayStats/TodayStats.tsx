import { useCallback } from 'react';
import { View } from 'react-native';
import { useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText, Card, ListRow, StatTile } from '@/shared/ui';
import { useTodayStats } from '../../hooks/useTodayStats';
import { createStyles } from './TodayStats.styles';

export type TodayStatsProps = { onOpenTopic: (topicId: string) => void };

/** Today's streak and accuracy (as text, no flame icons) and a suggested topic. */
export default function TodayStats({ onOpenTopic }: TodayStatsProps) {
  const styles = useThemedStyles(createStyles);
  const { progress: strings } = useStrings();
  const { ready, tiles, suggestion } = useTodayStats();
  const openSuggestion = useCallback(() => {
    if (suggestion) {
      onOpenTopic(suggestion.topicId);
    }
  }, [onOpenTopic, suggestion]);

  if (!ready) {
    return null;
  }
  return (
    <>
      <View style={styles.tiles}>
        {tiles.map(({ key, ...tile }) => (
          <StatTile key={key} {...tile} />
        ))}
      </View>
      {suggestion ? (
        <Card>
          <AppText variant="label" tone="muted" accessibilityRole="header">
            {strings.suggestion.title}
          </AppText>
          <ListRow title={suggestion.title} meta={suggestion.meta} onPress={openSuggestion} />
        </Card>
      ) : null}
    </>
  );
}
