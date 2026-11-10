import { createContext, useContext } from 'react';

/**
 * Reloads the whole app with a fresh store, as after a restart. The app provides it; screens
 * that replace all data (import, reset) use it so every feature reads the new data.
 */
const AppRestartContext = createContext<() => void>(() => undefined);

export const AppRestartProvider = AppRestartContext.Provider;
export const useAppRestart = () => useContext(AppRestartContext);
