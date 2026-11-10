import { createSlice } from '@reduxjs/toolkit';
import type { TopicProgress } from '../model/topicProgress';
import { loadTopicProgress, setTopicStatus } from './thunks';

export type StudyMapState = {
  /** The user's progress, by topic id. A topic without an entry is not started. */
  byTopicId: Record<string, TopicProgress>;
  status: 'idle' | 'loading' | 'ready' | 'error';
};

export const initialStudyMapState: StudyMapState = { byTopicId: {}, status: 'idle' };

const studyMapSlice = createSlice({
  name: 'studyMap',
  initialState: initialStudyMapState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadTopicProgress.pending, state => {
        state.status = 'loading';
      })
      .addCase(loadTopicProgress.fulfilled, (state, action) => {
        state.byTopicId = Object.fromEntries(action.payload.map(entry => [entry.topicId, entry]));
        state.status = 'ready';
      })
      .addCase(loadTopicProgress.rejected, state => {
        state.status = 'error';
      })
      .addCase(setTopicStatus.fulfilled, (state, action) => {
        state.byTopicId[action.payload.topicId] = action.payload;
      });
  },
});

export const studyMapReducer = studyMapSlice.reducer;
