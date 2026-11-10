// Public API of the daily-tests feature. Must stay free of react-native imports at load time
// (registries.ts loads it in Node for content validation), so screens are lazy.
import { lazy } from 'react';

export {
  dailySessionSchema,
  sessionStatusSchema,
  sessionStatuses,
  testScopeSchema,
  type DailySession,
  type SessionStatus,
} from './model/dailySession';
export type {
  SessionPlan,
  ShortfallRemedy,
  TestBuildContext,
  TestDefinition,
  TestItemKind,
  TestSchedule,
  TestScope,
} from './model/testDefinition';
export { createTestRegistry, testsWithSchedule, type TestRegistry } from './services/testRegistry';
export type { SessionRepository } from './repository/SessionRepository';
export { createLocalSessionRepository } from './repository/LocalSessionRepository';
export { attemptsSince, availableExerciseIds, sessionSeed } from './services/sessionHelpers';
export { dailyTestsReducer, type DailyTestsState, type TodayCardState } from './state/slice';
export { loadToday, type DailyTestsDependencies } from './state/thunks';
export { startOnDemandSession, type StartOnDemandInput } from './state/onDemandThunks';
export { useStartOnDemand } from './hooks/useStartOnDemand';
export type { TodayScreenProps } from './screens/TodayScreen';

export const TodayScreen = lazy(() => import('./screens/TodayScreen'));
