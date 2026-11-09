import { eq } from 'drizzle-orm';
import { type AppDatabase, type InvalidRowHandler, parseRows, tables } from '@/db';
import { topicProgressSchema } from '../model/topicProgress';
import type { TopicProgressRepository } from './TopicProgressRepository';

const { topicProgress } = tables;

export function createLocalTopicProgressRepository(
  db: AppDatabase,
  onInvalid?: InvalidRowHandler,
): TopicProgressRepository {
  const parse = (rows: Record<string, unknown>[]) =>
    parseRows(rows, { table: 'topic_progress', schema: topicProgressSchema, onInvalid });

  return {
    getAll: async () => parse(await db.select().from(topicProgress)),
    get: async topicId => {
      const rows = await db.select().from(topicProgress).where(eq(topicProgress.topicId, topicId));
      return parse(rows)[0] ?? null;
    },
    save: async progress => {
      const row = {
        topicId: progress.topicId,
        status: progress.status,
        studiedAt: progress.studiedAt ?? null,
        notes: progress.notes ?? null,
        updatedAt: progress.updatedAt,
      };
      await db
        .insert(topicProgress)
        .values(row)
        .onConflictDoUpdate({ target: topicProgress.topicId, set: row });
    },
  };
}
