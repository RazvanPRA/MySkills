import { useStrings } from '@/shared/i18n';
import { Card, TextField } from '@/shared/ui';
import { useTopicNotes } from '../../hooks/useTopicNotes';

/** "My notes": a multi-line field that saves itself (brief §9.6). */
export function TopicNotes({ topicId }: { topicId: string }) {
  const { topic: strings } = useStrings();
  const { notes, change } = useTopicNotes(topicId);
  return (
    <Card>
      <TextField
        label={strings.notes}
        help={strings.notesHelp}
        value={notes}
        onChangeText={change}
        multiline
      />
    </Card>
  );
}
