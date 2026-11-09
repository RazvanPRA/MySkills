import { useState } from 'react';
import { StatusBar } from 'react-native';
import { ContentProvider, type ExerciseTypeLookup } from '@/features/content';
import { RootNavigator } from '@/navigation';
import { useTheme } from '@/shared/theme';
import { BootstrapGate } from './bootstrap/BootstrapGate';
import type { AppDependencies } from './dependencyTypes';
import { AppProviders } from './providers/AppProviders';
import { exerciseTypeRegistry } from './registries';
import { createStore } from './store';

function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />;
}

type AppRootProps = {
  dependencies: AppDependencies;
  exerciseTypes?: ExerciseTypeLookup;
};

/** The whole app for a given dependency container (device or test). */
export function AppRoot({ dependencies, exerciseTypes = exerciseTypeRegistry }: AppRootProps) {
  // Created once per app instance (lazy initial state), never re-created on re-render.
  const [store] = useState(() => createStore(dependencies));
  return (
    <AppProviders store={store}>
      <ThemedStatusBar />
      <BootstrapGate dependencies={dependencies} exerciseTypes={exerciseTypes}>
        {content => (
          <ContentProvider value={content}>
            <RootNavigator />
          </ContentProvider>
        )}
      </BootstrapGate>
    </AppProviders>
  );
}
