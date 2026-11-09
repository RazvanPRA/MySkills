import { PlaceholderScreen } from './PlaceholderScreen';

// Thin screen components mounted by the tab navigator. Each is replaced by a feature
// screen (imported from that feature's index.ts) in the phase noted here.
export const TodayTab = () => <PlaceholderScreen section="today" phase={2} />;
export const StudyTab = () => <PlaceholderScreen section="study" phase={4} />;
export const ProgressTab = () => <PlaceholderScreen section="progress" phase={4} />;
export const SettingsTab = () => <PlaceholderScreen section="settings" phase={4} />;
