import { useStrings } from '@/shared/i18n';
import { AppText, Button, Card, MarkdownText, ScreenContainer, ScreenHeader } from '@/shared/ui';
import { TopicActions, type TopicPractice } from '../components/TopicActions/TopicActions';
import { TopicNotes } from '../components/TopicNotes/TopicNotes';
import { TopicResources } from '../components/TopicResources/TopicResources';
import { TopicStatusCard } from '../components/TopicStatusCard/TopicStatusCard';
import { useEnsureTopicProgress } from '../hooks/useEnsureTopicProgress';
import { useOpenUrl } from '../hooks/useOpenUrl';
import { useTopicDetail } from '../hooks/useTopicDetail';

export type TopicScreenProps = {
  topicId: string;
  onBack: () => void;
  /** "Exersează topicul" (brief §9.6); the app provides it. */
  practice?: TopicPractice;
};

/** Topic detail (design system §6.3): status, summary, resources, notes and practice. */
export default function TopicScreen({ topicId, onBack, practice }: TopicScreenProps) {
  const { topic: strings, player } = useStrings();
  useEnsureTopicProgress();
  const { view, status, statusOptions, changeStatus } = useTopicDetail(topicId);
  const openUrl = useOpenUrl();

  if (!view) {
    return (
      <ScreenContainer bottomInset>
        <ScreenHeader title={strings.notFound} />
        <Button label={strings.back} variant="secondary" onPress={onBack} />
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer bottomInset>
      <ScreenHeader title={view.title} subtitle={view.subtitle} />
      {view.isFallback ? (
        <AppText variant="caption" tone="muted">
          {player.onlyRomanian}
        </AppText>
      ) : null}
      <TopicStatusCard
        markable={view.markable}
        status={status}
        options={statusOptions}
        onChange={changeStatus}
      />
      <Card>
        <AppText variant="label" tone="muted" accessibilityRole="header">
          {strings.summary}
        </AppText>
        <MarkdownText content={view.summary} onLinkPress={openUrl} />
      </Card>
      <TopicResources resources={view.resources} title={strings.resources} onOpen={openUrl} />
      <TopicNotes topicId={topicId} />
      <TopicActions
        topicId={topicId}
        exerciseCount={view.exerciseCount}
        practice={practice}
        onBack={onBack}
      />
    </ScreenContainer>
  );
}
