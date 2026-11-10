// Public API of the onboarding feature (brief §9.1). The screen is lazy so the index loads
// without react-native.
import { lazy } from 'react';

export { assessableCategories, topicsToMark } from './services/topicsToMark.service';
export { completeOnboarding } from './state/thunks';

export const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen'));
