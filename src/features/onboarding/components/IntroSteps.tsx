import { ReminderControl } from '@/features/notifications';
import { useStrings } from '@/shared/i18n';
import { AppText, Card, SetupRow, Tag } from '@/shared/ui';

/** Step 1: what the app does and the track. */
export function WelcomeStep() {
  const { onboarding } = useStrings();
  return (
    <Card>
      <AppText variant="title" accessibilityRole="header">
        {onboarding.welcome.title}
      </AppText>
      <AppText>{onboarding.welcome.body}</AppText>
      <SetupRow label={onboarding.welcome.track} help={onboarding.welcome.trackHelp}>
        <Tag label={onboarding.welcome.trackName} />
      </SetupRow>
    </Card>
  );
}

/** Step 3: how many topics the self-assessment marks. */
export function ReviewStep({ markCount }: { markCount: number }) {
  const { onboarding, counts } = useStrings();
  return (
    <Card>
      <AppText variant="title" accessibilityRole="header">
        {onboarding.review.title}
      </AppText>
      <AppText accessibilityLiveRegion="polite">
        {markCount > 0
          ? onboarding.review.body(counts.topics(markCount))
          : onboarding.review.nothing}
      </AppText>
      <AppText variant="small" tone="muted">
        {onboarding.review.help}
      </AppText>
    </Card>
  );
}

/** Step 4: the daily reminder, the same control as in Settings. */
export function ReminderStep() {
  const { onboarding } = useStrings();
  return (
    <Card>
      <AppText variant="title" accessibilityRole="header">
        {onboarding.reminder.title}
      </AppText>
      <ReminderControl />
    </Card>
  );
}
