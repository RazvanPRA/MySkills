import { useStrings } from '@/shared/i18n';
import { AppText, Card, SegmentedControl } from '@/shared/ui';
import type { TopicStatus } from '../../model/topicProgress';

type TopicStatusCardProps = {
  /** False for categories that do not feed the knowledge test (logic): reading only. */
  markable: boolean;
  status: TopicStatus;
  options: { id: TopicStatus; label: string }[];
  onChange: (status: TopicStatus) => void;
};

/** The topic's status, or why a logic topic has none. */
export function TopicStatusCard({ markable, status, options, onChange }: TopicStatusCardProps) {
  const { topic: strings } = useStrings();
  return (
    <Card>
      <AppText variant="label" tone="muted">
        {strings.status}
      </AppText>
      {markable ? (
        <SegmentedControl
          options={options}
          value={status}
          onChange={onChange}
          accessibilityLabel={strings.status}
        />
      ) : (
        <AppText variant="small" tone="muted">
          {strings.notMarkable}
        </AppText>
      )}
    </Card>
  );
}
