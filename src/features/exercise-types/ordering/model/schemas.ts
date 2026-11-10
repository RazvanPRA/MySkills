import { z } from 'zod';
import { localizedTextSchema } from '@/shared/domain';

export const MIN_ORDERING_ITEMS = 2;
export const MAX_ORDERING_ITEMS = 8;

export const orderingPayloadSchema = z.object({
  /** In the correct order (Markdown). The renderer starts from a shuffled order. */
  items: z.array(localizedTextSchema).min(MIN_ORDERING_ITEMS).max(MAX_ORDERING_ITEMS),
});
export type OrderingPayload = z.infer<typeof orderingPayloadSchema>;

/** The user's order, as indices into `items`: [2, 0, 1] = item 2 first. */
export const orderingAnswerSchema = z.object({
  order: z
    .array(z.number().int().nonnegative())
    .min(MIN_ORDERING_ITEMS)
    .refine(order => new Set(order).size === order.length, 'order must not repeat items'),
});
export type OrderingAnswer = z.infer<typeof orderingAnswerSchema>;
