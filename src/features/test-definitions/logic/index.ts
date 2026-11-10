// Public API of the 'logic' test definition (brief §7.2).
import type { TestDefinition } from '@/features/daily-tests';
import { LOGIC_KIND } from './model/constants';
import { buildLogicSession } from './services/buildLogicSession.service';

export const logicTest: TestDefinition = {
  kind: LOGIC_KIND,
  title: { ro: 'Test de logică', en: 'Logic test' },
  schedule: 'daily',
  // Logic avoids repeats with its own 30-day rule instead of FSRS reviews.
  spacedRepetition: false,
  buildSession: buildLogicSession,
};
