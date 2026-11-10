import { useStrings } from '@/shared/i18n';
import { ActionRow, AppText, Button, ScreenContainer } from '@/shared/ui';
import { ResultsSummary } from '../components/ResultsSummary/ResultsSummary';
import { ReviewList } from '../components/ReviewList/ReviewList';
import { useSessionResults } from '../hooks/useSessionResults';

export type SessionResultsScreenProps = {
  sessionId: string;
  onDone: () => void;
  onOpenTopic: (topicId: string) => void;
};

/** Results (design system §6.3): score, verdict, topics to re-read, and "Gata". */
export default function SessionResultsScreen({
  sessionId,
  onDone,
  onOpenTopic,
}: SessionResultsScreenProps) {
  const { player, results: strings } = useStrings();
  const results = useSessionResults(sessionId);
  if (!results) {
    return (
      <ScreenContainer bottomInset>
        <AppText tone="muted">{player.loading}</AppText>
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer bottomInset>
      <ResultsSummary summary={results.summary} />
      <ReviewList rows={results.rows} onOpenTopic={onOpenTopic} />
      <ActionRow>
        <Button label={strings.done} onPress={onDone} />
      </ActionRow>
    </ScreenContainer>
  );
}
