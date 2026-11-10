// Public API of the code_output exercise type. Free of React Native at load time:
// content validation imports it in Node, so the Renderer is loaded lazily.
import { lazy } from 'react';
import { defineExerciseType } from '@/features/content';
import {
  type CodeOutputAnswer,
  codeOutputAnswerSchema,
  type CodeOutputPayload,
  codeOutputPayloadSchema,
} from './model/schemas';
import { evaluateCodeOutput } from './services/evaluateCodeOutput.service';

export const codeOutput = defineExerciseType<CodeOutputPayload, CodeOutputAnswer>({
  type: 'code_output',
  payloadSchema: codeOutputPayloadSchema,
  answerSchema: codeOutputAnswerSchema,
  Renderer: lazy(() => import('./components/CodeOutputRenderer/CodeOutputRenderer')),
  evaluate: evaluateCodeOutput,
});

export type { CodeOutputAnswer, CodeOutputPayload };
