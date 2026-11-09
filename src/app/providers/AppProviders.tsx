import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as StoreProvider } from 'react-redux';
import { ThemeProvider } from '@/shared/theme';
import type { AppStore } from '../store';
import { StoreLanguageProvider } from './StoreLanguageProvider';

type AppProvidersProps = PropsWithChildren<{ store: AppStore }>;

export function AppProviders({ store, children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <StoreProvider store={store}>
        <ThemeProvider>
          <StoreLanguageProvider>{children}</StoreLanguageProvider>
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
