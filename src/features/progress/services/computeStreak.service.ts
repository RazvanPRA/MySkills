import { addDays, startOfWeek } from '@/shared/utils/localDate';
import type { SessionFact } from '../model/facts';

/**
 * Days on which the daily tests were done (brief §7.3): at least one daily session exists and
 * every daily session of that day is completed. A test with nothing to serve that day has no
 * session, so it does not block the day.
 */
export function completedDays(
  sessions: readonly SessionFact[],
  dailyKinds: ReadonlySet<string>,
): Set<string> {
  const byDay = new Map<string, boolean>();
  for (const session of sessions) {
    if (dailyKinds.has(session.testKind)) {
      const done = session.status === 'completed';
      byDay.set(session.date, (byDay.get(session.date) ?? true) && done);
    }
  }
  return new Set([...byDay].filter(([, done]) => done).map(([day]) => day));
}

export type StreakInput = {
  completed: ReadonlySet<string>;
  /** First day the app generated a daily test; the streak never reaches before it. */
  firstDay: string | null;
  today: string;
};

export type Streak = {
  days: number;
  /** Missed days covered by the weekly freeze (one per Monday–Sunday week). */
  frozenDays: string[];
  todayDone: boolean;
};

/**
 * Current streak (brief §7.3). Today does not break it until the day is over. A missed day
 * is covered by the freeze of its week when that freeze is still unused; otherwise it ends
 * the streak. Missed days do not stack up into debt.
 */
export function computeStreak({ completed, firstDay, today }: StreakInput): Streak {
  const todayDone = completed.has(today);
  const frozenDays: string[] = [];
  const frozenWeeks = new Set<string>();
  let days = 0;
  let oldestCounted: string | null = null;
  let day = todayDone ? today : addDays(today, -1);
  while (firstDay !== null && day >= firstDay) {
    const week = startOfWeek(day);
    if (completed.has(day)) {
      days += 1;
      oldestCounted = day;
    } else if (frozenWeeks.has(week)) {
      break;
    } else {
      frozenWeeks.add(week);
      frozenDays.push(day);
    }
    day = addDays(day, -1);
  }
  // Freezes older than the oldest counted day bridged nothing: the streak ended there.
  const bridged = frozenDays.filter(frozen => oldestCounted !== null && frozen > oldestCounted);
  return { days, frozenDays: bridged, todayDone };
}
