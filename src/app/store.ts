import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { dailyTestsReducer } from '@/features/daily-tests';
import { sessionPlayerReducer } from '@/features/session-player';
import { settingsReducer } from '@/features/settings';
import { studyMapReducer } from '@/features/study-map';
import type { AppDependencies } from './dependencyTypes';

// One slice per feature, registered here.
const rootReducer = combineReducers({
  settings: settingsReducer,
  studyMap: studyMapReducer,
  dailyTests: dailyTestsReducer,
  sessionPlayer: sessionPlayerReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Thunks receive the dependency container as `extra`, so they never import implementations. */
export function createStore(dependencies: AppDependencies, preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: { extraArgument: dependencies } }),
  });
}

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
