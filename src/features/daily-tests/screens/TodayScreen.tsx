import type { ReactNode } from 'react';
import { formatLongDate, useLanguage, useStrings } from '@/shared/i18n';
import { AppText, Button, Card, ScreenContainer, ScreenHeader } from '@/shared/ui';
import { TestCard } from '../components/TestCard/TestCard';
import { useToday } from '../hooks/useToday';

export type TodayScreenProps = {
  onStartSession: (sessionId: string) => void;
  onMarkTopics: () => void;
  /** Composed below the cards by the app (streak, accuracy, suggested topic). */
  children?: ReactNode;
};

/** Today (design system §6.3): one card per daily test. A new daily test appears by itself. */
export default function TodayScreen({ onStartSession, onMarkTopics, children }: TodayScreenProps) {
  const { today: strings } = useStrings();
  const language = useLanguage();
  const { status, date, cards, reload } = useToday();
  return (
    <ScreenContainer>
      <ScreenHeader
        title={strings.title}
        subtitle={date ? formatLongDate(date, language) : undefined}
      />
      {status === 'loading' ? <AppText tone="muted">{strings.loading}</AppText> : null}
      {status === 'error' ? (
        <Card>
          <AppText tone="muted">{strings.error}</AppText>
          <Button label={strings.retry} variant="secondary" onPress={reload} />
        </Card>
      ) : null}
      {cards.map(card => (
        <TestCard
          key={card.kind}
          card={card}
          onStart={onStartSession}
          onMarkTopics={onMarkTopics}
          markTopicsLabel={strings.markTopics}
        />
      ))}
      {children}
    </ScreenContainer>
  );
}
