import { createSelector } from '@reduxjs/toolkit';
import { addDays } from '@/shared/utils/localDate';
import { attemptsBetweenDays, averageScore } from '../services/accuracy.service';
import { completedDays, computeStreak } from '../services/computeStreak.service';
import type { ProgressState } from './slice';

/** The minimal root-state shape this feature needs; the app's RootState satisfies it. */
export type WithProgress = { progress: ProgressState };

export const selectProgress = (state: WithProgress) => state.progress;

/** First day a daily test was generated (within the loaded year). */
const selectFirstDailyDay = createSelector([selectProgress], ({ sessions, dailyKinds }) => {
  const days = sessions.filter(s => dailyKinds.includes(s.testKind)).map(s => s.date);
  return days.length === 0 ? null : days.reduce((min, day) => (day < min ? day : min));
});

export const selectStreak = createSelector(
  [selectProgress, selectFirstDailyDay],
  ({ sessions, dailyKinds, today }, firstDay) =>
    today === null
      ? null
      : computeStreak({
          completed: completedDays(sessions, new Set(dailyKinds)),
          firstDay,
          today,
        }),
);

/** Accuracy over the last 7 local days, today included. */
export const selectWeekAccuracy = createSelector([selectProgress], ({ attempts, today }) => {
  if (today === null) {
    return null;
  }
  const recent = attemptsBetweenDays(attempts, addDays(today, -6), today);
  return { accuracy: averageScore(recent), count: recent.length };
});
