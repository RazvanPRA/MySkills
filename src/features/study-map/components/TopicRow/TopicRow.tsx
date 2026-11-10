import { memo, useCallback } from 'react';
import { ListRow, Tag } from '@/shared/ui';

type TopicRowProps = {
  id: string;
  title: string;
  /** Level, e.g. "Mid". */
  meta: string;
  /** Null for topics without a status (logic): no Tag. */
  statusLabel: string | null;
  /** Stable callback shared by every row, receiving the topic id. */
  onOpen: (topicId: string) => void;
};

/** A topic in the study map: title, level, and its status as a read-only Tag (if any). */
function TopicRowBase({ id, title, meta, statusLabel, onOpen }: TopicRowProps) {
  const handlePress = useCallback(() => onOpen(id), [onOpen, id]);
  return (
    <ListRow
      title={title}
      meta={meta}
      accessory={statusLabel ? <Tag label={statusLabel} /> : undefined}
      accessoryLabel={statusLabel ?? undefined}
      onPress={handlePress}
    />
  );
}

export const TopicRow = memo(TopicRowBase);
