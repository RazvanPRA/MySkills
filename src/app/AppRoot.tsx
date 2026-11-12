import { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { ContentProvider, ExerciseTypesProvider } from '@/features/content';
import { AppRestartProvider, RootNavigator } from '@/navigation';
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

/**
 * The whole app for a given dependency container (device or test). Restarting (after a data
 * import or reset) remounts the app with a fresh store, as if it were opened again.
 */
export function AppRoot({ dependencies }: AppRootProps) {
  const [generation, setGeneration] = useState(0);
  const restart = useCallback(() => setGeneration(value => value + 1), []);
  return (
    <AppRestartProvider value={restart}>
      <AppInstance key={generation} dependencies={dependencies} />
    </AppRestartProvider>
  );
}

function AppInstance({ dependencies }: AppRootProps) {
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
