import { useStrings } from '@/shared/i18n';
import {
  AppText,
  Button,
  Card,
  MarkdownText,
  ScreenContainer,
  ScreenHeader,
  SegmentedControl,
} from '@/shared/ui';
import { TopicResources } from '../components/TopicResources/TopicResources';
import { useEnsureTopicProgress } from '../hooks/useEnsureTopicProgress';
import { useOpenUrl } from '../hooks/useOpenUrl';
import { useTopicDetail } from '../hooks/useTopicDetail';

export type TopicScreenProps = { topicId: string; onBack: () => void };

/** Topic detail (minimal): status, summary and resources. Phase 4 adds notes and practice. */
export default function TopicScreen({ topicId, onBack }: TopicScreenProps) {
  const { topic: strings, player } = useStrings();
  useEnsureTopicProgress();
  const { view, status, statusOptions, changeStatus } = useTopicDetail(topicId);
  const openUrl = useOpenUrl();

  if (!view) {
    return (
      <ScreenContainer>
        <ScreenHeader title={strings.notFound} />
        <Button label={strings.back} variant="secondary" onPress={onBack} />
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer>
      <ScreenHeader title={view.title} subtitle={view.subtitle} />
      {view.isFallback ? (
        <AppText variant="caption" tone="muted">
          {player.onlyRomanian}
        </AppText>
      ) : null}
      <Card>
        <AppText variant="label" tone="muted">
          {strings.status}
        </AppText>
        <SegmentedControl
          options={statusOptions}
          value={status}
          onChange={changeStatus}
          accessibilityLabel={strings.status}
        />
      </Card>
      <Card>
        <AppText variant="label" tone="muted" accessibilityRole="header">
          {strings.summary}
        </AppText>
        <MarkdownText content={view.summary} onLinkPress={openUrl} />
      </Card>
      <TopicResources resources={view.resources} title={strings.resources} onOpen={openUrl} />
      <Button label={strings.back} variant="secondary" onPress={onBack} />
    </ScreenContainer>
  );
}
