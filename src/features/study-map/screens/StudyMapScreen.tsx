import { useStrings } from '@/shared/i18n';
import { AppText, Button, Card, ScreenContainer, ScreenHeader, TextField } from '@/shared/ui';
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs';
import { LevelFilter } from '../components/LevelFilter/LevelFilter';
import { TopicSections } from '../components/TopicSections/TopicSections';
import { useEnsureTopicProgress } from '../hooks/useEnsureTopicProgress';
import { useStudyMap } from '../hooks/useStudyMap';

export type StudyMapScreenProps = { onOpenTopic: (topicId: string) => void };

/** Categories → topics by level, with search and a level filter (design system §6.3). */
export default function StudyMapScreen({ onOpenTopic }: StudyMapScreenProps) {
  const { studyMap: strings, bootstrap } = useStrings();
  const { status, retry } = useEnsureTopicProgress();
  const map = useStudyMap();
  const emptyText =
    map.levels.length === 0 ? strings.noLevels : map.searching ? strings.noMatches : strings.empty;
  return (
    <ScreenContainer>
      <ScreenHeader title={strings.title} subtitle={strings.subtitle} />
      {status === 'error' ? (
        <Card>
          <AppText tone="muted">{strings.loadError}</AppText>
          <Button label={bootstrap.retry} variant="secondary" onPress={retry} />
        </Card>
      ) : null}
      <TextField
        label={strings.search}
        help={strings.searchHelp}
        value={map.query}
        onChangeText={map.setQuery}
      />
      {map.searching ? null : (
        <CategoryTabs
          tabs={map.tabs}
          selectedId={map.selectedId}
          onSelect={map.select}
          accessibilityLabel={strings.categories}
        />
      )}
      <LevelFilter selected={map.levels} onToggle={map.toggleLevel} />
      <TopicSections sections={map.sections} onOpenTopic={onOpenTopic} emptyText={emptyText} />
    </ScreenContainer>
  );
}
