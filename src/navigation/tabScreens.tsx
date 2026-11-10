import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { DataCard } from '@/features/backup';
import { TodayScreen } from '@/features/daily-tests';
import { ProgressScreen, TodayStats } from '@/features/progress';
import { SettingsScreen } from '@/features/settings';
import { StudyMapScreen } from '@/features/study-map';
import { useAppRestart } from './AppRestart';

// Thin screen components mounted by the tab navigator: they map navigation to the props of
// feature screens (imported from each feature's index.ts) and compose features together.
export function TodayTab() {
  const navigation = useNavigation();
  const startSession = useCallback(
    (sessionId: string) => navigation.navigate('Session', { sessionId }),
    [navigation],
  );
  const markTopics = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Study' }),
    [navigation],
  );
  const openTopic = useCallback(
    (topicId: string) => navigation.navigate('Topic', { topicId }),
    [navigation],
  );
  return (
    <TodayScreen onStartSession={startSession} onMarkTopics={markTopics}>
      <TodayStats onOpenTopic={openTopic} />
    </TodayScreen>
  );
}

export function StudyTab() {
  const navigation = useNavigation();
  const openTopic = useCallback(
    (topicId: string) => navigation.navigate('Topic', { topicId }),
    [navigation],
  );
  return <StudyMapScreen onOpenTopic={openTopic} />;
}

export function ProgressTab() {
  const navigation = useNavigation();
  const openTopic = useCallback(
    (topicId: string) => navigation.navigate('Topic', { topicId }),
    [navigation],
  );
  const openSession = useCallback(
    (sessionId: string) => navigation.navigate('SessionResults', { sessionId }),
    [navigation],
  );
  return <ProgressScreen onOpenTopic={openTopic} onOpenSession={openSession} />;
}

export function SettingsTab() {
  const restart = useAppRestart();
  return (
    <SettingsScreen>
      <DataCard onDataReplaced={restart} />
    </SettingsScreen>
  );
}
