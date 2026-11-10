import type { ContentCatalog } from '@/features/content';
import { addDays, parseLocalDate } from '@/shared/utils/localDate';
import { hashString } from '@/shared/utils/seededRandom';
import type { DailySession } from '../model/dailySession';

/** Brief §6.2: hash(date + kind), so the same day always gives the same test. */
export const sessionSeed = (date: string, testKind: string): number =>
  hashString(`${date}:${testKind}`);

/** Exercises of a session that still exist in the content (removed ones are skipped). */
export const availableExerciseIds = (
  session: Pick<DailySession, 'exerciseIds'>,
  catalog: ContentCatalog,
): string[] => session.exerciseIds.filter(id => catalog.exercisesById.has(id));

/** Estimated duration in whole minutes (at least 1 for a non-empty test). */
export function estimatedMinutes(exerciseIds: readonly string[], catalog: ContentCatalog): number {
  const seconds = exerciseIds.reduce(
    (sum, id) => sum + (catalog.exercisesById.get(id)?.estimatedSeconds ?? 0),
    0,
  );
  return Math.ceil(seconds / 60);
}

/** Pure: the attempts answered in the last `days` local days before `date` (and on `date`). */
export function attemptsSince<T extends { answeredAt: string }>(
  attempts: readonly T[],
  { date, days }: { date: string; days: number },
): T[] {
  const since = parseLocalDate(addDays(date, -days)).toISOString();
  return attempts.filter(attempt => attempt.answeredAt >= since);
}
