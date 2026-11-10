import type { EvaluationResult } from '@/shared/domain';
import type { OrderingAnswer, OrderingPayload } from '../model/schemas';

/** A full permutation of 0..length-1. */
const isPermutation = (order: readonly number[], length: number) =>
  order.length === length && order.every(index => index < length) && new Set(order).size === length;

/**
 * Pure (design system §6.2): each item in its place earns credit; correct only when all are.
 * An order that is not a full permutation of the items earns nothing.
 */
export function evaluateOrdering(
  payload: OrderingPayload,
  answer: OrderingAnswer,
): EvaluationResult {
  const total = payload.items.length;
  if (!isPermutation(answer.order, total)) {
    return { correct: false, score: 0, credit: { earned: 0, total } };
  }
  const earned = answer.order.filter((item, position) => item === position).length;
  return { correct: earned === total, score: earned / total, credit: { earned, total } };
}
