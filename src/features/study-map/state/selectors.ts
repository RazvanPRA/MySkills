import type { TopicStatus } from '../model/topicProgress';
import type { StudyMapState } from './slice';

/** The minimal root-state shape this feature needs; the app's RootState satisfies it. */
type WithStudyMap = { studyMap: StudyMapState };

export const selectStudyMapStatus = (state: WithStudyMap) => state.studyMap.status;

export const selectTopicProgressById = (state: WithStudyMap) => state.studyMap.byTopicId;

/** A topic without stored progress is not started. */
export const selectTopicStatus = (state: WithStudyMap, topicId: string): TopicStatus =>
  state.studyMap.byTopicId[topicId]?.status ?? 'not_started';
