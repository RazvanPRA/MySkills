// Public API of the 'knowledge' test definition (brief §7.1).
import type { TestDefinition } from '@/features/daily-tests';
import { KNOWLEDGE_KIND } from './model/constants';
import { buildKnowledgeSession } from './services/buildKnowledgeSession.service';

export const knowledgeTest: TestDefinition = {
  kind: KNOWLEDGE_KIND,
  title: { ro: 'Test de cunoștințe', en: 'Knowledge test' },
  schedule: 'daily',
  spacedRepetition: true,
  buildSession: buildKnowledgeSession,
};
