// Public API of the ordering exercise type. Free of React Native at load time:
// content validation imports it in Node, so the Renderer is loaded lazily.
import { lazy } from 'react';
import { defineExerciseType } from '@/features/content';
import {
  type OrderingAnswer,
  orderingAnswerSchema,
  type OrderingPayload,
  orderingPayloadSchema,
} from './model/schemas';
import { evaluateOrdering } from './services/evaluateOrdering.service';

export const ordering = defineExerciseType<OrderingPayload, OrderingAnswer>({
  type: 'ordering',
  payloadSchema: orderingPayloadSchema,
  answerSchema: orderingAnswerSchema,
  Renderer: lazy(() => import('./components/OrderingRenderer/OrderingRenderer')),
  evaluate: evaluateOrdering,
});

export type { OrderingAnswer, OrderingPayload };
