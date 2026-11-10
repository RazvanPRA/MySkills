import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { useStartOnDemand } from '@/features/daily-tests';
import { SessionResultsScreen, SessionScreen } from '@/features/session-player';
import { TopicScreen } from '@/features/study-map';
import { practiceTest } from '@/features/test-definitions/practice';
import type { RootStackParamList } from './types';

// Thin route adapters: they map route params and navigation to the feature screens' props,
// so features never import navigation.

type RouteProps<Name extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Name
>;

export function TopicRoute({ route, navigation }: RouteProps<'Topic'>) {
  // Composition across features: study-map shows the button, daily-tests starts the session.
  const openSession = useCallback(
    (sessionId: string) => navigation.navigate('Session', { sessionId }),
    [navigation],
  );
  const { start, busy, failed } = useStartOnDemand(practiceTest.kind, openSession);
  const practice = useMemo(
    () => ({ onPress: (topicId: string) => start({ topicIds: [topicId] }), busy, failed }),
    [start, busy, failed],
  );
  return (
    <TopicScreen topicId={route.params.topicId} onBack={navigation.goBack} practice={practice} />
  );
}

export function SessionRoute({ route, navigation }: RouteProps<'Session'>) {
  // Results replace the player, so "back" from the results never reopens a finished test.
  const finish = useCallback(
    (sessionId: string) => navigation.replace('SessionResults', { sessionId }),
    [navigation],
  );
  const openTopic = useCallback(
    (topicId: string) => navigation.navigate('Topic', { topicId }),
    [navigation],
  );
  return (
    <SessionScreen
      sessionId={route.params.sessionId}
      onFinish={finish}
      onLeave={navigation.goBack}
      onOpenTopic={openTopic}
    />
  );
}

export function SessionResultsRoute({ route, navigation }: RouteProps<'SessionResults'>) {
  // Back to where the results were opened from: Today after a test, Progress from history.
  const done = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Tabs', { screen: 'Today' });
    }
  }, [navigation]);
  const openTopic = useCallback(
    (topicId: string) => navigation.navigate('Topic', { topicId }),
    [navigation],
  );
  return (
    <SessionResultsScreen
      sessionId={route.params.sessionId}
      onDone={done}
      onOpenTopic={openTopic}
    />
  );
}
