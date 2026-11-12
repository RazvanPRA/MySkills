import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Clock } from '@/shared/utils/clock';
import { isCovered, type TopicProgress, type TopicStatus } from '../model/topicProgress';
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

/**
 * Marks many topics as studied at once (onboarding). Topics already in progress or studied are
 * left as they are, so nothing is ever downgraded. Resolves to the changed entries.
 */
export const markTopicsStudied = createAsyncThunk<TopicProgress[], readonly string[], ThunkConfig>(
  'studyMap/markStudied',
  async (topicIds, { extra }) => {
    const repository = extra.repositories.topicProgress;
    const current = new Map((await repository.getAll()).map(entry => [entry.topicId, entry]));
    const now = extra.clock.now();
    const changed: TopicProgress[] = [];
    for (const topicId of topicIds) {
      const previous = current.get(topicId);
      if (previous && isCovered(previous)) {
        continue;
      }
      const next = changeTopicStatus({ topicId, status: 'studied', previous, now });
      await repository.save(next);
      changed.push(next);
    }
    return changed;
  },
);
