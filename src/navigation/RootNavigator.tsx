import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Suspense, useMemo } from 'react';
import { ReminderSync } from '@/features/notifications';
import { OnboardingScreen } from '@/features/onboarding';
import { useSettings } from '@/features/settings';
import { useTheme } from '@/shared/theme';
import { linking } from './linking';
import { toNavigationTheme } from './navigationTheme';
import { SessionResultsRoute, SessionRoute, TopicRoute } from './stackScreens';
import { SuspenseLayout } from './SuspenseLayout';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const STACK_OPTIONS = { headerShown: false, animation: 'none' } as const;

export function RootNavigator() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);
  const { onboardingDone } = useSettings().settings;
  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <Suspense fallback={null}>
        <ReminderSync />
      </Suspense>
      <Stack.Navigator screenOptions={STACK_OPTIONS} screenLayout={SuspenseLayout}>
        {/* Conditional screens: finishing onboarding swaps the stack (no "back" to it). */}
        {onboardingDone ? (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="Topic" component={TopicRoute} />
            <Stack.Screen name="Session" component={SessionRoute} />
            <Stack.Screen name="SessionResults" component={SessionResultsRoute} />
          </>
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
