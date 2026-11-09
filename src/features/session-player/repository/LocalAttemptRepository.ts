import { asc, eq, gte } from 'drizzle-orm';
import { type AppDatabase, type InvalidRowHandler, parseRows, tables } from '@/db';
import { attemptSchema } from '../model/attempt';
import type { AttemptRepository } from './AttemptRepository';

const { attempts } = tables;

export function createLocalAttemptRepository(
  db: AppDatabase,
  onInvalid?: InvalidRowHandler,
): AttemptRepository {
  const parse = (rows: Record<string, unknown>[]) =>
    parseRows(rows, { table: 'attempts', schema: attemptSchema, onInvalid });
  const ordered = () => db.select().from(attempts).$dynamic();

  return {
    add: async attempt => {
      await db.insert(attempts).values({ ...attempt, confidence: attempt.confidence ?? null });
    },
    listBySession: async sessionId =>
      parse(
        await ordered().where(eq(attempts.sessionId, sessionId)).orderBy(asc(attempts.answeredAt)),
      ),
    listSince: async since =>
      parse(
        await ordered().where(gte(attempts.answeredAt, since)).orderBy(asc(attempts.answeredAt)),
      ),
  };
}
