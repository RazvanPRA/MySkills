import type { AppDatabase, InvalidRowHandler } from '@/db';
import { createLocalSessionRepository } from '@/features/daily-tests';
import { createLocalAttemptRepository } from '@/features/session-player';
import { createLocalReviewCardRepository } from '@/features/spaced-repetition';
import { createLocalTopicProgressRepository } from '@/features/study-map';

const reportInvalidRow: InvalidRowHandler = (table, error) =>
  console.warn(`[storage] skipped an invalid row in ${table}: ${error.message}`);

/**
 * SQLite-backed repositories over a database. Shared by the device container
 * (op-sqlite) and the test container (better-sqlite3); free of native imports.
 */
export function createRepositories(db: AppDatabase) {
  return {
    topicProgress: createLocalTopicProgressRepository(db, reportInvalidRow),
    reviewCards: createLocalReviewCardRepository(db, reportInvalidRow),
    sessions: createLocalSessionRepository(db, reportInvalidRow),
    attempts: createLocalAttemptRepository(db, reportInvalidRow),
  };
}
