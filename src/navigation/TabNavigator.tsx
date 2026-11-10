import {
  type BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';
import { useStrings } from '@/shared/i18n';
import { type Theme, useTheme } from '@/shared/theme';
import { SuspenseLayout } from './SuspenseLayout';
import { ProgressTab, SettingsTab, StudyTab, TodayTab } from './tabScreens';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const noIcon = () => null;

/** Text-only tabs (design system §7): body 600, active accent, inactive muted. */
export const tabScreenOptions = ({ color, typography }: Theme): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarIcon: noIcon,
  tabBarIconStyle: { display: 'none' },
  tabBarActiveTintColor: color.accent,
  tabBarInactiveTintColor: color.muted,
  tabBarStyle: { backgroundColor: color.surface, borderTopColor: color.border },
  tabBarLabelStyle: { fontSize: typography.body.fontSize, fontWeight: '600' },
});

/**
 * Title + translated accessibility label. Without the label, React Navigation announces
 * a hard-coded English "<title>, tab, 1 of 4"; the screen reader adds the role itself.
 */
const tabOptions = (title: string): BottomTabNavigationOptions => ({
  title,
  tabBarAccessibilityLabel: title,
});

export function TabNavigator() {
  const theme = useTheme();
  const { tabs } = useStrings();
  const screenOptions = useMemo(() => tabScreenOptions(theme), [theme]);
  return (
    <Tab.Navigator screenOptions={screenOptions} screenLayout={SuspenseLayout}>
      <Tab.Screen name="Today" component={TodayTab} options={tabOptions(tabs.today)} />
      <Tab.Screen name="Study" component={StudyTab} options={tabOptions(tabs.study)} />
      <Tab.Screen name="Progress" component={ProgressTab} options={tabOptions(tabs.progress)} />
      <Tab.Screen name="Settings" component={SettingsTab} options={tabOptions(tabs.settings)} />
    </Tab.Navigator>
  );
}
