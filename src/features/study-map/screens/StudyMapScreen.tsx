import { useStrings } from '@/shared/i18n';
import { AppText, Button, Card, ScreenContainer, ScreenHeader } from '@/shared/ui';
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs';
import { TopicSections } from '../components/TopicSections/TopicSections';
import { useEnsureTopicProgress } from '../hooks/useEnsureTopicProgress';
import { useStudyMap } from '../hooks/useStudyMap';

export type StudyMapScreenProps = { onOpenTopic: (topicId: string) => void };

/** Categories → topics by level, with the user's status (minimal map; Phase 4 adds filters). */
export default function StudyMapScreen({ onOpenTopic }: StudyMapScreenProps) {
  const { studyMap: strings, bootstrap } = useStrings();
  const { status, retry } = useEnsureTopicProgress();
  const { tabs, selectedId, select, sections } = useStudyMap();
  return (
    <ScreenContainer>
      <ScreenHeader title={strings.title} subtitle={strings.subtitle} />
      {status === 'error' ? (
        <Card>
          <AppText tone="muted">{strings.loadError}</AppText>
          <Button label={bootstrap.retry} variant="secondary" onPress={retry} />
        </Card>
      ) : null}
      <CategoryTabs
        tabs={tabs}
        selectedId={selectedId}
        onSelect={select}
        accessibilityLabel={strings.categories}
      />
      <TopicSections sections={sections} onOpenTopic={onOpenTopic} emptyText={strings.empty} />
    </ScreenContainer>
  );
}
