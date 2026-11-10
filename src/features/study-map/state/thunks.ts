import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Clock } from '@/shared/utils/clock';
import type { TopicProgress, TopicStatus } from '../model/topicProgress';
import type { TopicProgressRepository } from '../repository/TopicProgressRepository';
import { changeTopicNotes } from '../services/changeTopicNotes.service';
import { changeTopicStatus } from '../services/changeTopicStatus.service';
import type { StudyMapState } from './slice';

/** What this feature needs from the dependency container. */
export type StudyMapDependencies = {
  clock: Clock;
  repositories: { topicProgress: TopicProgressRepository };
};

type ThunkConfig = { extra: StudyMapDependencies; state: { studyMap: StudyMapState } };

export const loadTopicProgress = createAsyncThunk<TopicProgress[], void, ThunkConfig>(
  'studyMap/load',
  (_, { extra }) => extra.repositories.topicProgress.getAll(),
);

export const setTopicStatus = createAsyncThunk<
  TopicProgress,
  { topicId: string; status: TopicStatus },
  ThunkConfig
>('studyMap/setStatus', async ({ topicId, status }, { extra, getState }) => {
  const previous = getState().studyMap.byTopicId[topicId];
  const next = changeTopicStatus({ topicId, status, previous, now: extra.clock.now() });
  await extra.repositories.topicProgress.save(next);
  return next;
});

export const setTopicNotes = createAsyncThunk<
  TopicProgress,
  { topicId: string; notes: string },
  ThunkConfig
>('studyMap/setNotes', async ({ topicId, notes }, { extra, getState }) => {
  const previous = getState().studyMap.byTopicId[topicId];
  const next = changeTopicNotes({ topicId, notes, previous, now: extra.clock.now() });
  await extra.repositories.topicProgress.save(next);
  return next;
});
