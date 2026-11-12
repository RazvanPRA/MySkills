import { Card } from '@/shared/ui';
import ReminderControl from '../ReminderControl/ReminderControl';

/** The reminder setting as a Settings section. */
export default function ReminderCard() {
  return (
    <Card>
      <ReminderControl />
    </Card>
  );
}
