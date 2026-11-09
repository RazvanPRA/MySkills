import { useState } from 'react';
import { AppRoot } from './AppRoot';
import { createDependencies } from './dependencies';

/** Device entry point: the real dependency container (SQLite, AsyncStorage, bundled packs). */
export function App() {
  const [dependencies] = useState(createDependencies);
  return <AppRoot dependencies={dependencies} />;
}
