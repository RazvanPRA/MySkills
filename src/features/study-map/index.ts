// Public API of the study-map feature. Must stay free of react-native imports at load time
// (registries.ts → knowledge test → isCovered is loaded in Node), so screens are lazy.
import { lazy } from 'react';

export {
  topicProgressSchema,
  topicStatusSchema,
  topicStatuses,
  isCovered,
  type TopicProgress,
  type TopicStatus,
} from './model/topicProgress';
export type { TopicProgressRepository } from './repository/TopicProgressRepository';
export { createLocalTopicProgressRepository } from './repository/LocalTopicProgressRepository';
export { studyMapReducer, type StudyMapState } from './state/slice';
export { loadTopicProgress, setTopicStatus, type StudyMapDependencies } from './state/thunks';
export { selectTopicStatus, selectTopicProgressById } from './state/selectors';
export { useEnsureTopicProgress } from './hooks/useEnsureTopicProgress';
export type { StudyMapScreenProps } from './screens/StudyMapScreen';
export type { TopicScreenProps } from './screens/TopicScreen';

export const StudyMapScreen = lazy(() => import('./screens/StudyMapScreen'));
export const TopicScreen = lazy(() => import('./screens/TopicScreen'));
