// Public API of the session-player feature. Free of react-native imports at load time
// (other features' indexes reach it in Node), so screens are lazy.
import { lazy } from 'react';

export { attemptSchema, type Attempt } from './model/attempt';
export type { AttemptRepository } from './repository/AttemptRepository';
export { createLocalAttemptRepository } from './repository/LocalAttemptRepository';
export { sessionPlayerReducer, type SessionPlayerState } from './state/slice';
export type { SessionPlayerDependencies } from './state/thunks';
export type { SessionScreenProps } from './screens/SessionScreen';
export type { SessionResultsScreenProps } from './screens/SessionResultsScreen';

export const SessionScreen = lazy(() => import('./screens/SessionScreen'));
export const SessionResultsScreen = lazy(() => import('./screens/SessionResultsScreen'));
