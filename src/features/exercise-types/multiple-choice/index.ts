// Public API of the multiple_choice exercise type. Free of React Native at load time:
// content validation imports it in Node, so the Renderer is loaded lazily.
import { lazy } from 'react';
import { defineExerciseType } from '@/features/content';
import {
  type MultipleChoiceAnswer,
  multipleChoiceAnswerSchema,
  type MultipleChoicePayload,
  multipleChoicePayloadSchema,
} from './model/schemas';
import { evaluateMultipleChoice } from './services/evaluateMultipleChoice.service';

export const multipleChoice = defineExerciseType<MultipleChoicePayload, MultipleChoiceAnswer>({
  type: 'multiple_choice',
  payloadSchema: multipleChoicePayloadSchema,
  answerSchema: multipleChoiceAnswerSchema,
  Renderer: lazy(() => import('./components/MultipleChoiceRenderer/MultipleChoiceRenderer')),
  evaluate: evaluateMultipleChoice,
});

export type { MultipleChoiceAnswer, MultipleChoicePayload };
