import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '@/shared/ui';
import type { TopicSection } from '../../hooks/useStudyMap';
import { TopicRow } from '../TopicRow/TopicRow';
import { createStyles } from './TopicSections.styles';

type TopicSectionsProps = {
  sections: readonly TopicSection[];
  onOpenTopic: (topicId: string) => void;
  emptyText: string;
};

/** Topics of one category, grouped Junior → Mid → Senior. */
function TopicSectionsBase({ sections, onOpenTopic, emptyText }: TopicSectionsProps) {
  const styles = useThemedStyles(createStyles);
  if (sections.length === 0) {
    return <AppText tone="muted">{emptyText}</AppText>;
  }
  return (
    <View style={styles.sections}>
      {sections.map(section => (
        <View key={section.level} style={styles.section}>
          <AppText variant="label" tone="muted" accessibilityRole="header">
            {section.label}
          </AppText>
          {section.rows.map(row => (
            <TopicRow key={row.id} {...row} onOpen={onOpenTopic} />
          ))}
        </View>
      ))}
    </View>
  );
}

export const TopicSections = memo(TopicSectionsBase);
