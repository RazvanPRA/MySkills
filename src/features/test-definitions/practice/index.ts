// Public API of the 'practice' test definition (brief §9.6: "Practice this topic only").
import type { TestDefinition } from '@/features/daily-tests';
import { PRACTICE_KIND } from './model/constants';
import { buildPracticeSession } from './services/buildPracticeSession.service';

export const practiceTest: TestDefinition = {
  kind: PRACTICE_KIND,
  title: { ro: 'Exersare', en: 'Practice' },
  schedule: 'on_demand',
  // Extra practice counts for mastery but does not move FSRS reviews earlier or later.
  spacedRepetition: false,
  buildSession: buildPracticeSession,
};
