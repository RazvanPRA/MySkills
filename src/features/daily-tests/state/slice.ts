import { createSlice } from '@reduxjs/toolkit';
import type { LocalizedText } from '@/shared/domain';
import type { DailySession } from '../model/dailySession';
import type { SessionPlan, TestItemKind } from '../model/testDefinition';
import { loadToday } from './thunks';

/** One card on Today: a daily test and its session for today (null when nothing to test). */
export type TodayCardState = {
  kind: string;
  title: LocalizedText;
  itemKind: TestItemKind;
  session: DailySession | null;
  shortfall: NonNullable<SessionPlan['shortfall']> | null;
  /** Exercises already answered in today's session. */
  answered: number;
};

export type DailyTestsState = {
  date: string | null;
  cards: TodayCardState[];
  status: 'idle' | 'loading' | 'ready' | 'error';
};

export const initialDailyTestsState: DailyTestsState = { date: null, cards: [], status: 'idle' };

const dailyTestsSlice = createSlice({
  name: 'dailyTests',
  initialState: initialDailyTestsState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadToday.pending, state => {
        // Keep showing the previous cards while refreshing (no layout jump).
        state.status = state.cards.length > 0 ? 'ready' : 'loading';
      })
      .addCase(loadToday.fulfilled, (state, action) => {
        state.date = action.payload.date;
        state.cards = action.payload.cards;
        state.status = 'ready';
      })
      .addCase(loadToday.rejected, state => {
        state.status = 'error';
      });
  },
});

export const dailyTestsReducer = dailyTestsSlice.reducer;
