// Public API of the find_bug exercise type. Free of React Native at load time:
// content validation imports it in Node, so the Renderer is loaded lazily.
import { lazy } from 'react';
import { defineExerciseType } from '@/features/content';
import {
  type FindBugAnswer,
  findBugAnswerSchema,
  type FindBugPayload,
  findBugPayloadSchema,
} from './model/schemas';
import { evaluateFindBug } from './services/evaluateFindBug.service';

export const findBug = defineExerciseType<FindBugPayload, FindBugAnswer>({
  type: 'find_bug',
  payloadSchema: findBugPayloadSchema,
  answerSchema: findBugAnswerSchema,
  Renderer: lazy(() => import('./components/FindBugRenderer/FindBugRenderer')),
  evaluate: evaluateFindBug,
});

export type { FindBugAnswer, FindBugPayload };
