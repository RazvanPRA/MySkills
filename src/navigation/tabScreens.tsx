import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { StudyMapScreen } from '@/features/study-map';
import { PlaceholderScreen } from './PlaceholderScreen';

// Thin screen components mounted by the tab navigator. Each placeholder is replaced by a
// feature screen (imported from that feature's index.ts) in the phase noted here.
export const TodayTab = () => <PlaceholderScreen section="today" phase={2} />;

export function StudyTab() {
  const navigation = useNavigation();
  const openTopic = useCallback(
    (topicId: string) => navigation.navigate('Topic', { topicId }),
    [navigation],
  );
  return <StudyMapScreen onOpenTopic={openTopic} />;
}

export const ProgressTab = () => <PlaceholderScreen section="progress" phase={4} />;
export const SettingsTab = () => <PlaceholderScreen section="settings" phase={4} />;
