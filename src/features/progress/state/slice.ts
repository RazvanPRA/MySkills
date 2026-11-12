import { createSlice } from '@reduxjs/toolkit';
import type { LocalizedText } from '@/shared/domain';
import type { AttemptFact, CardFact, SessionFact } from '../model/facts';
import { loadProgress } from './thunks';

/** Source data for mastery, streak and history; everything else is derived by selectors. */
export type ProgressState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** The instant and local day of the last load: derived values use them, not the clock. */
  now: string | null;
  today: string | null;
  attempts: AttemptFact[];
  cards: CardFact[];
  sessions: SessionFact[];
  /** Kinds of the daily tests: only they count for the streak. */
  dailyKinds: string[];
  /** Title of every registered test, by kind (history rows). */
  testTitles: Record<string, LocalizedText>;
};

export const initialProgressState: ProgressState = {
  status: 'idle',
  now: null,
  today: null,
  attempts: [],
  cards: [],
  sessions: [],
  dailyKinds: [],
  testTitles: {},
};

const progressSlice = createSlice({
  name: 'progress',
  initialState: initialProgressState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadProgress.pending, state => {
        // Keep showing the previous values while refreshing (no layout jump).
        state.status = state.now === null ? 'loading' : 'ready';
      })
      .addCase(loadProgress.fulfilled, (_state, action) => ({ status: 'ready', ...action.payload }))
      .addCase(loadProgress.rejected, state => {
        state.status = 'error';
      });
  },
});

export const progressReducer = progressSlice.reducer;
