import { memo, useCallback } from 'react';
import { ListRow, Tag } from '@/shared/ui';

type TopicRowProps = {
  id: string;
  title: string;
  /** Level, e.g. "Mid". */
  meta: string;
  statusLabel: string;
  /** Stable callback shared by every row, receiving the topic id. */
  onOpen: (topicId: string) => void;
};

/** A topic in the study map: title, level, and its status as a read-only Tag. */
function TopicRowBase({ id, title, meta, statusLabel, onOpen }: TopicRowProps) {
  const handlePress = useCallback(() => onOpen(id), [onOpen, id]);
  return (
    <ListRow
      title={title}
      meta={meta}
      accessory={<Tag label={statusLabel} />}
      accessoryLabel={statusLabel}
      onPress={handlePress}
    />
  );
}

export const TopicRow = memo(TopicRowBase);
