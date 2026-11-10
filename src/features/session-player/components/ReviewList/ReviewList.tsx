import { memo, useCallback } from 'react';
import { useStrings } from '@/shared/i18n';
import { AppText, Card, ListRow } from '@/shared/ui';
import type { ReviewRowModel } from '../../hooks/useSessionResults';

type ReviewRowProps = ReviewRowModel & { onOpen: (topicId: string) => void };

function ReviewRowBase({ topicId, title, meta, onOpen }: ReviewRowProps) {
  const handlePress = useCallback(() => onOpen(topicId), [onOpen, topicId]);
  return <ListRow title={title} meta={meta} onPress={handlePress} />;
}

const ReviewRow = memo(ReviewRowBase);

type ReviewListProps = { rows: readonly ReviewRowModel[]; onOpenTopic: (topicId: string) => void };

/** "De recitit": topics with mistakes, each opening the topic (brief §7.3). */
function ReviewListBase({ rows, onOpenTopic }: ReviewListProps) {
  const { results } = useStrings();
  return (
    <Card>
      <AppText variant="label" tone="muted" accessibilityRole="header">
        {results.toReview}
      </AppText>
      {rows.length === 0 ? <AppText tone="muted">{results.nothingToReview}</AppText> : null}
      {rows.map(row => (
        <ReviewRow key={row.topicId} {...row} onOpen={onOpenTopic} />
      ))}
    </Card>
  );
}

export const ReviewList = memo(ReviewListBase);
