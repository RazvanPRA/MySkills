// Public API of the daily-tests feature.
export {
  dailySessionSchema,
  sessionStatusSchema,
  sessionStatuses,
  type DailySession,
  type SessionStatus,
} from './model/dailySession';
export type {
  SessionPlan,
  TestBuildContext,
  TestDefinition,
  TestSchedule,
  TestScope,
} from './model/testDefinition';
export { createTestRegistry, testsWithSchedule, type TestRegistry } from './services/testRegistry';
export type { SessionRepository } from './repository/SessionRepository';
export { createLocalSessionRepository } from './repository/LocalSessionRepository';
