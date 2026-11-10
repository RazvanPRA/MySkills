import { addDays, startOfWeek, toLocalDate } from '@/shared/utils/localDate';
import type { AttemptFact } from '../model/facts';

/** Mean score 0–100 of the attempts, or null when there are none. */
export function averageScore(attempts: readonly Pick<AttemptFact, 'score'>[]): number | null {
  if (attempts.length === 0) {
    return null;
  }
  const total = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return Math.round((total / attempts.length) * 100);
}

/** Attempts answered on the local days `from`..`to` (inclusive). */
export function attemptsBetweenDays<T extends Pick<AttemptFact, 'answeredAt'>>(
  attempts: readonly T[],
  from: string,
  to: string,
): T[] {
  return attempts.filter(attempt => {
    const day = toLocalDate(new Date(attempt.answeredAt));
    return day >= from && day <= to;
  });
}

export type WeekAccuracy = {
  /** Monday of the week, YYYY-MM-DD. */
  weekStart: string;
  accuracy: number | null;
  count: number;
};

/** Accuracy for each of the last `weeks` Monday–Sunday weeks, oldest first, including this one. */
export function accuracyByWeek(
  attempts: readonly AttemptFact[],
  { today, weeks }: { today: string; weeks: number },
): WeekAccuracy[] {
  const current = startOfWeek(today);
  return Array.from({ length: weeks }, (_, index) => {
    const weekStart = addDays(current, -7 * (weeks - 1 - index));
    const inWeek = attemptsBetweenDays(attempts, weekStart, addDays(weekStart, 6));
    return { weekStart, accuracy: averageScore(inWeek), count: inWeek.length };
  });
}

/** Drops the weeks before the first answer (a new user sees one week, not eight empty ones). */
export function fromFirstAnsweredWeek(weeks: readonly WeekAccuracy[]): WeekAccuracy[] {
  const first = weeks.findIndex(week => week.count > 0);
  return weeks.slice(first === -1 ? Math.max(0, weeks.length - 1) : first);
}
