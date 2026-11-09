import { and, asc, between, eq } from 'drizzle-orm';
import { type AppDatabase, type InvalidRowHandler, parseRows, tables } from '@/db';
import { type DailySession, dailySessionSchema } from '../model/dailySession';
import type { SessionRepository } from './SessionRepository';

const { dailySessions } = tables;

const toRow = (session: DailySession) => ({
  ...session,
  startedAt: session.startedAt ?? null,
  completedAt: session.completedAt ?? null,
  score: session.score ?? null,
});

export function createLocalSessionRepository(
  db: AppDatabase,
  onInvalid?: InvalidRowHandler,
): SessionRepository {
  const parse = (rows: Record<string, unknown>[]) =>
    parseRows(rows, { table: 'daily_sessions', schema: dailySessionSchema, onInvalid });
  const first = async (rows: Record<string, unknown>[]) => parse(rows)[0] ?? null;

  return {
    findByDateAndKind: async (date, testKind) =>
      first(
        await db
          .select()
          .from(dailySessions)
          .where(and(eq(dailySessions.date, date), eq(dailySessions.testKind, testKind))),
      ),
    getById: async id =>
      first(await db.select().from(dailySessions).where(eq(dailySessions.id, id))),
    listBetween: async (from, to) =>
      parse(
        await db
          .select()
          .from(dailySessions)
          .where(between(dailySessions.date, from, to))
          .orderBy(asc(dailySessions.date), asc(dailySessions.testKind)),
      ),
    save: async session => {
      const row = toRow(session);
      await db
        .insert(dailySessions)
        .values(row)
        .onConflictDoUpdate({ target: dailySessions.id, set: row });
    },
  };
}
