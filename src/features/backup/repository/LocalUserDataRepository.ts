import { asc } from 'drizzle-orm';
import { type AppDatabase, parseRows, tables } from '@/db';
import { attemptSchema } from '@/features/session-player';
import { dailySessionSchema } from '@/features/daily-tests';
import { reviewCardSchema } from '@/features/spaced-repetition';
import { topicProgressSchema } from '@/features/study-map';
import type { UserDataSnapshot } from '../model/backup';
import type { UserDataRepository } from './UserDataRepository';

const { attempts, dailySessions, reviewCards, topicProgress } = tables;

/** Rows per INSERT: far below SQLite's bound-parameter limit. */
const CHUNK = 100;

type Transaction = Parameters<Parameters<AppDatabase['transaction']>[0]>[0];

async function insertChunks<T>(rows: readonly T[], insert: (chunk: T[]) => Promise<unknown>) {
  for (let start = 0; start < rows.length; start += CHUNK) {
    await insert(rows.slice(start, start + CHUNK));
  }
}

/** Children first: attempts reference sessions. */
async function deleteAll(tx: Transaction) {
  await tx.delete(attempts);
  await tx.delete(dailySessions);
  await tx.delete(reviewCards);
  await tx.delete(topicProgress);
}

async function insertAll(tx: Transaction, data: UserDataSnapshot) {
  await insertChunks(data.topicProgress, chunk => tx.insert(topicProgress).values(chunk));
  await insertChunks(data.reviewCards, chunk => tx.insert(reviewCards).values(chunk));
  await insertChunks(data.sessions, chunk => tx.insert(dailySessions).values(chunk));
  await insertChunks(data.attempts, chunk =>
    tx.insert(attempts).values(chunk.map(a => ({ ...a, confidence: a.confidence ?? null }))),
  );
}

export function createLocalUserDataRepository(db: AppDatabase): UserDataRepository {
  // Strict: a row that does not parse fails the export instead of silently disappearing.
  const strict =
    <T>(table: string, schema: Parameters<typeof parseRows<T>>[1]['schema']) =>
    (rows: Record<string, unknown>[]) =>
      parseRows(rows, {
        table,
        schema,
        onInvalid: (name, error) => {
          throw new Error(`Cannot export ${name}: ${error.message}`);
        },
      });

  return {
    readAll: async () => ({
      topicProgress: strict(
        'topic_progress',
        topicProgressSchema,
      )(await db.select().from(topicProgress).orderBy(asc(topicProgress.topicId))),
      reviewCards: strict(
        'review_cards',
        reviewCardSchema,
      )(await db.select().from(reviewCards).orderBy(asc(reviewCards.exerciseId))),
      sessions: strict(
        'daily_sessions',
        dailySessionSchema,
      )(
        await db
          .select()
          .from(dailySessions)
          .orderBy(asc(dailySessions.date), asc(dailySessions.id)),
      ),
      attempts: strict(
        'attempts',
        attemptSchema,
      )(await db.select().from(attempts).orderBy(asc(attempts.answeredAt), asc(attempts.id))),
    }),
    replaceAll: snapshot =>
      db.transaction(async tx => {
        await deleteAll(tx);
        await insertAll(tx, snapshot);
      }),
    clearAll: () => db.transaction(tx => deleteAll(tx)),
  };
}
