// Public API of the single_choice exercise type. Free of React Native at load time:
// content validation imports it in Node, so the Renderer is loaded lazily.
import { lazy } from 'react';
import { defineExerciseType } from '@/features/content';
import {
  type SingleChoiceAnswer,
  singleChoiceAnswerSchema,
  type SingleChoicePayload,
  singleChoicePayloadSchema,
} from './model/schemas';
import { evaluateSingleChoice } from './services/evaluateSingleChoice.service';

export const singleChoice = defineExerciseType<SingleChoicePayload, SingleChoiceAnswer>({
  type: 'single_choice',
  payloadSchema: singleChoicePayloadSchema,
  answerSchema: singleChoiceAnswerSchema,
  Renderer: lazy(() => import('./components/SingleChoiceRenderer/SingleChoiceRenderer')),
  evaluate: evaluateSingleChoice,
});

export type { SingleChoiceAnswer, SingleChoicePayload };
