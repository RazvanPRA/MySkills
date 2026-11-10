import { memo, useCallback } from 'react';
import { ActionRow, AppText, Button, Card, Tag } from '@/shared/ui';
import type { TodayCardModel } from '../../services/presentTodayCard';

type TestCardProps = {
  card: TodayCardModel;
  onStart: (sessionId: string) => void;
  onMarkTopics: () => void;
  markTopicsLabel: string;
};

/** One daily test on Today: label, size, status, and one primary action (or the score). */
function TestCardBase({ card, onStart, onMarkTopics, markTopicsLabel }: TestCardProps) {
  const { primary } = card;
  const handleStart = useCallback(() => {
    if (primary) {
      onStart(primary.sessionId);
    }
  }, [primary, onStart]);
  const hasActions = primary !== null || card.showMarkTopics;
  return (
    <Card>
      <AppText variant="label" tone="muted" accessibilityRole="header">
        {card.title}
      </AppText>
      {card.meta ? <AppText variant="small">{card.meta}</AppText> : null}
      <Tag label={card.statusLabel} />
      {card.notice ? (
        <AppText variant="small" tone="muted">
          {card.notice}
        </AppText>
      ) : null}
      {card.scoreText ? <AppText variant="title">{card.scoreText}</AppText> : null}
      {hasActions ? (
        <ActionRow>
          {card.showMarkTopics ? (
            <Button label={markTopicsLabel} variant="secondary" onPress={onMarkTopics} />
          ) : null}
          {primary ? <Button label={primary.label} onPress={handleStart} /> : null}
        </ActionRow>
      ) : null}
    </Card>
  );
}

export const TestCard = memo(TestCardBase);
