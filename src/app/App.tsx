import { useState } from 'react';
import { StatusBar } from 'react-native';
import { RootNavigator } from '@/navigation';
import { useTheme } from '@/shared/theme';
import { createDependencies } from './dependencies';
import { AppProviders } from './providers/AppProviders';
import { createStore } from './store';

function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />;
}

export function App() {
  // Created once per app instance (lazy initial state), never re-created on re-render.
  const [store] = useState(() => createStore(createDependencies()));
  return (
    <AppProviders store={store}>
      <ThemedStatusBar />
      <RootNavigator />
    </AppProviders>
  );
}
