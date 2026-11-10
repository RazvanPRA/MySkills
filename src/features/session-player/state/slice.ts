import { createSlice } from '@reduxjs/toolkit';
import type { DailySession } from '@/features/daily-tests';
import type { LocalizedText } from '@/shared/domain';
import type { Attempt } from '../model/attempt';
import type { PlayerStep } from '../services/nextPrimaryAction.service';
import { resumeIndex } from '../services/progressSession.service';
import { goToNext, openSession, submitAnswer } from './thunks';

export type SessionPlayerState = {
  status: 'idle' | 'loading' | 'ready' | 'missing' | 'error';
  session: DailySession | null;
  testTitle: LocalizedText | null;
  /** The session's exercises that still exist in the content. */
  exerciseIds: string[];
  attempts: Attempt[];
  /** Current exercise; equals exerciseIds.length when everything is answered. */
  index: number;
  step: PlayerStep;
  /** The answer being composed (validated by the type's answerSchema on submit). */
  draft: unknown;
  /** When the current exercise was shown (ISO), for the attempt's duration. */
  shownAt: string | null;
  saving: boolean;
  saveFailed: boolean;
};

export const initialSessionPlayerState: SessionPlayerState = {
  status: 'idle',
  session: null,
  testTitle: null,
  exerciseIds: [],
  attempts: [],
  index: 0,
  step: 'answering',
  draft: null,
  shownAt: null,
  saving: false,
  saveFailed: false,
};

const sessionPlayerSlice = createSlice({
  name: 'sessionPlayer',
  initialState: initialSessionPlayerState,
  reducers: {
    draftChanged: (state, action: { payload: unknown }) => {
      state.draft = action.payload;
    },
    /** Flashcards: "Arată răspunsul". */
    answerShown: state => {
      state.step = 'revealed';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(openSession.pending, state => {
        state.status = state.status === 'ready' ? 'ready' : 'loading';
      })
      .addCase(openSession.fulfilled, (state, { payload }) => {
        if (!payload) {
          return { ...initialSessionPlayerState, status: 'missing' };
        }
        const index = resumeIndex(payload.exerciseIds, payload.attempts);
        // Reopening the same exercise keeps the answer being composed (design system §6.1).
        const sameExercise = state.session?.id === payload.session.id && state.index === index;
        return {
          ...initialSessionPlayerState,
          ...payload,
          status: 'ready',
          index,
          draft: sameExercise && state.step === 'answering' ? state.draft : null,
        };
      })
      .addCase(openSession.rejected, state => {
        state.status = 'error';
      })
      .addCase(submitAnswer.pending, state => {
        state.saving = true;
        state.saveFailed = false;
      })
      .addCase(submitAnswer.fulfilled, (state, { payload }) => {
        state.attempts.push(payload.attempt);
        state.session = payload.session;
        state.saving = false;
        state.step = 'revealed';
      })
      .addCase(submitAnswer.rejected, state => {
        state.saving = false;
        state.saveFailed = true;
      })
      .addCase(goToNext.fulfilled, (state, { payload }) => {
        state.index = resumeIndex(state.exerciseIds, state.attempts);
        state.step = 'answering';
        state.draft = null;
        state.shownAt = payload;
      });
  },
});

export const { draftChanged, answerShown } = sessionPlayerSlice.actions;
export const sessionPlayerReducer = sessionPlayerSlice.reducer;
