import { useState } from 'react';
import { StatusBar } from 'react-native';
import { ContentProvider, ExerciseTypesProvider } from '@/features/content';
import { RootNavigator } from '@/navigation';
import { useTheme } from '@/shared/theme';
import { BootstrapGate } from './bootstrap/BootstrapGate';
import type { AppDependencies } from './dependencyTypes';
import { AppProviders } from './providers/AppProviders';
import { createStore } from './store';

function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />;
}

type AppRootProps = { dependencies: AppDependencies };

/** The whole app for a given dependency container (device or test). */
export function AppRoot({ dependencies }: AppRootProps) {
  const { exerciseTypes } = dependencies.registries;
  // Created once per app instance (lazy initial state), never re-created on re-render.
  const [store] = useState(() => createStore(dependencies));
  return (
    <AppProviders store={store}>
      <ThemedStatusBar />
      <BootstrapGate dependencies={dependencies} exerciseTypes={exerciseTypes}>
        {content => (
          <ContentProvider value={content}>
            <ExerciseTypesProvider value={exerciseTypes}>
              <RootNavigator />
            </ExerciseTypesProvider>
          </ContentProvider>
        )}
      </BootstrapGate>
    </AppProviders>
  );
}
