import { memo, useCallback } from 'react';
import { AppText, Card, ListRow } from '@/shared/ui';
import type { LinkItem } from '../../services/presentProgressLists';

export type LinkListCardProps = {
  title: string;
  empty: string;
  items: readonly LinkItem[];
  onOpen: (id: string) => void;
};

type LinkRowProps = { item: LinkItem; onOpen: (id: string) => void };

function LinkRowBase({ item, onOpen }: LinkRowProps) {
  const open = useCallback(() => onOpen(item.id), [onOpen, item.id]);
  return <ListRow title={item.title} meta={item.meta} onPress={open} />;
}

const LinkRow = memo(LinkRowBase);

/** A titled card of rows that open something (weak topics, past tests), or an empty note. */
export function LinkListCard({ title, empty, items, onOpen }: LinkListCardProps) {
  return (
    <Card>
      <AppText variant="label" tone="muted" accessibilityRole="header">
        {title}
      </AppText>
      {items.length === 0 ? (
        <AppText variant="small" tone="muted">
          {empty}
        </AppText>
      ) : (
        items.map(item => <LinkRow key={item.id} item={item} onOpen={onOpen} />)
      )}
    </Card>
  );
}
