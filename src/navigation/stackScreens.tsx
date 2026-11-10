import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TopicScreen } from '@/features/study-map';
import type { RootStackParamList } from './types';

// Thin route adapters: they map route params and navigation to the feature screens' props.

export function TopicRoute({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Topic'>) {
  return <TopicScreen topicId={route.params.topicId} onBack={navigation.goBack} />;
}
