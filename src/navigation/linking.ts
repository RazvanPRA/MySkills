import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const DEEP_LINK_SCHEME = 'seniorprep://';

/** Deep links, e.g. `seniorprep://today` (the daily notification opens this). */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [DEEP_LINK_SCHEME],
  config: {
    screens: {
      Tabs: {
        screens: {
          Today: 'today',
          Study: 'study',
          Progress: 'progress',
          Settings: 'settings',
        },
      },
      Topic: 'topic/:topicId',
      Session: 'session/:sessionId',
    },
  },
};
