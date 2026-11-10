import type { DailySession } from '../model/dailySession';
import type { SessionPlan } from '../model/testDefinition';

type ReconcileInput = {
  /** Today's stored session of this test kind, if any. */
  existing: DailySession | null;
  /** What the test definition would build today. */
  plan: SessionPlan;
  date: string;
  testKind: string;
  newId: () => string;
};

type ReconcileResult = { session: DailySession | null; changed: boolean };

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

/**
 * Pure (brief §7.3): a started or completed session is frozen, so reopening the app gives the
 * same test with its progress. A pending one follows today's plan (e.g. after marking more
 * topics). No plan and no session → nothing to store.
 */
export function reconcileDailySession(input: ReconcileInput): ReconcileResult {
  const { existing, plan, date, testKind, newId } = input;
  if (existing && existing.status !== 'pending') {
    return { session: existing, changed: false };
  }
  if (existing) {
    return sameIds(existing.exerciseIds, plan.exerciseIds)
      ? { session: existing, changed: false }
      : { session: { ...existing, exerciseIds: plan.exerciseIds }, changed: true };
  }
  if (plan.exerciseIds.length === 0) {
    return { session: null, changed: false };
  }
  const session: DailySession = {
    id: newId(),
    date,
    testKind,
    exerciseIds: plan.exerciseIds,
    status: 'pending',
  };
  return { session, changed: true };
}
