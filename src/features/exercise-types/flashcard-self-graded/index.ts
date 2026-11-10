// Public API of the flashcard_self_graded exercise type. Free of React Native at load time:
// content validation imports it in Node, so the Renderer is loaded lazily.
import { lazy } from 'react';
import { defineExerciseType } from '@/features/content';
import {
  type FlashcardAnswer,
  flashcardAnswerSchema,
  type FlashcardPayload,
  flashcardPayloadSchema,
} from './model/schemas';
import { evaluateFlashcard, flashcardFsrsRating } from './services/evaluateFlashcard.service';

export const flashcardSelfGraded = defineExerciseType<FlashcardPayload, FlashcardAnswer>({
  type: 'flashcard_self_graded',
  payloadSchema: flashcardPayloadSchema,
  answerSchema: flashcardAnswerSchema,
  Renderer: lazy(() => import('./components/FlashcardRenderer/FlashcardRenderer')),
  evaluate: evaluateFlashcard,
  flow: 'self_graded',
  toFsrsRating: flashcardFsrsRating,
});

export type { FlashcardAnswer, FlashcardPayload };
