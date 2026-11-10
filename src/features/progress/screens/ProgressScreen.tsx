import { useStrings } from '@/shared/i18n';
import { AppText, Button, Card, ScreenContainer, ScreenHeader } from '@/shared/ui';
import { LinkListCard } from '../components/LinkListCard/LinkListCard';
import { MasteryTable } from '../components/MasteryTable/MasteryTable';
import { WeeklyAccuracy } from '../components/WeeklyAccuracy/WeeklyAccuracy';
import { useProgressScreen } from '../hooks/useProgressScreen';

export type ProgressScreenProps = {
  onOpenTopic: (topicId: string) => void;
  onOpenSession: (sessionId: string) => void;
};

/** Progress (brief §9.7): competency heatmap, logic accuracy, weak spots and history. */
export default function ProgressScreen({ onOpenTopic, onOpenSession }: ProgressScreenProps) {
  const { progress: strings, screens } = useStrings();
  const { status, reload, table, weeks, weak, history } = useProgressScreen();
  return (
    <ScreenContainer>
      <ScreenHeader title={screens.progress.title} subtitle={screens.progress.subtitle} />
      {status === 'loading' ? <AppText tone="muted">{strings.screen.loading}</AppText> : null}
      {status === 'error' ? (
        <Card>
          <AppText tone="muted">{strings.screen.error}</AppText>
          <Button label={strings.screen.retry} variant="secondary" onPress={reload} />
        </Card>
      ) : null}
      <Card>
        <AppText variant="label" tone="muted" accessibilityRole="header">
          {strings.matrix.title}
        </AppText>
        <MasteryTable rows={table} />
        <AppText variant="caption" tone="muted">
          {strings.matrix.help}
        </AppText>
      </Card>
      <Card>
        <AppText variant="label" tone="muted" accessibilityRole="header">
          {strings.logic.title}
        </AppText>
        <WeeklyAccuracy weeks={weeks} />
      </Card>
      <LinkListCard
        title={strings.weak.title}
        empty={strings.weak.empty}
        items={weak}
        onOpen={onOpenTopic}
      />
      <LinkListCard
        title={strings.history.title}
        empty={strings.history.empty}
        items={history}
        onOpen={onOpenSession}
      />
    </ScreenContainer>
  );
}
