import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { settingsReducer } from '@/features/settings';
import type { AppDependencies } from './dependencyTypes';

// One slice per feature, registered here.
const rootReducer = combineReducers({
  settings: settingsReducer,
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
