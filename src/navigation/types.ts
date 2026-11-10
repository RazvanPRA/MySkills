import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Today: undefined;
  Study: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Topic: { topicId: string };
  Session: { sessionId: string };
  SessionResults: { sessionId: string };
};

declare global {
  namespace ReactNavigation {
    // Makes useNavigation() and <Link> typed app-wide.
    interface RootParamList extends RootStackParamList {}
  }
}
