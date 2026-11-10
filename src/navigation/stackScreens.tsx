import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { SessionResultsScreen, SessionScreen } from '@/features/session-player';
import { TopicScreen } from '@/features/study-map';
import type { RootStackParamList } from './types';

// Thin route adapters: they map route params and navigation to the feature screens' props,
// so features never import navigation.

type RouteProps<Name extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Name
>;

export function TopicRoute({ route, navigation }: RouteProps<'Topic'>) {
  return <TopicScreen topicId={route.params.topicId} onBack={navigation.goBack} />;
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
  const done = useCallback(() => navigation.navigate('Tabs', { screen: 'Today' }), [navigation]);
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
