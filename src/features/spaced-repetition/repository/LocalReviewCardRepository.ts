import { asc, eq, lte } from 'drizzle-orm';
import { type AppDatabase, type InvalidRowHandler, parseRows, tables } from '@/db';
import { reviewCardSchema } from '../model/reviewCard';
import type { ReviewCardRepository } from './ReviewCardRepository';

const { reviewCards } = tables;

export function createLocalReviewCardRepository(
  db: AppDatabase,
  onInvalid?: InvalidRowHandler,
): ReviewCardRepository {
  const parse = (rows: Record<string, unknown>[]) =>
    parseRows(rows, { table: 'review_cards', schema: reviewCardSchema, onInvalid });

  return {
    getAll: async () => parse(await db.select().from(reviewCards)),
    get: async exerciseId => {
      const rows = await db
        .select()
        .from(reviewCards)
        .where(eq(reviewCards.exerciseId, exerciseId));
      return parse(rows)[0] ?? null;
    },
    // ISO-8601 UTC strings sort chronologically, so the indexed text comparison is correct.
    getDue: async until =>
      parse(
        await db
          .select()
          .from(reviewCards)
          .where(lte(reviewCards.due, until))
          .orderBy(asc(reviewCards.due)),
      ),
    save: async card => {
      const row = { ...card, lastReview: card.lastReview ?? null };
      await db
        .insert(reviewCards)
        .values(row)
        .onConflictDoUpdate({ target: reviewCards.exerciseId, set: row });
    },
  };
}
