import { memo, useCallback } from 'react';
import type { Resource } from '@/features/content';
import { AppText, Card, ListRow } from '@/shared/ui';
import { hostOf } from '../../services/hostOf';

type ResourceRowProps = { resource: Resource; onOpen: (url: string) => void };

function ResourceRowBase({ resource, onOpen }: ResourceRowProps) {
  const handlePress = useCallback(() => onOpen(resource.url), [onOpen, resource.url]);
  return <ListRow title={resource.title} meta={hostOf(resource.url)} onPress={handlePress} />;
}

const ResourceRow = memo(ResourceRowBase);

type TopicResourcesProps = {
  resources: readonly Resource[];
  title: string;
  onOpen: (url: string) => void;
};

/** Links to read more; hidden when the topic has none. */
function TopicResourcesBase({ resources, title, onOpen }: TopicResourcesProps) {
  if (resources.length === 0) {
    return null;
  }
  return (
    <Card>
      <AppText variant="label" tone="muted" accessibilityRole="header">
        {title}
      </AppText>
      {resources.map(resource => (
        <ResourceRow key={resource.url} resource={resource} onOpen={onOpen} />
      ))}
    </Card>
  );
}

export const TopicResources = memo(TopicResourcesBase);
