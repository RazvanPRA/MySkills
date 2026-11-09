import { drizzle, type SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import type { SqlExecutor } from './executor';
import * as schema from './schema';

export type AppDatabase = SqliteRemoteDatabase<typeof schema>;

/**
 * Drizzle over any SQLite client, through the sqlite-proxy driver.
 * (Drizzle 0.45's built-in op-sqlite driver targets an older op-sqlite API.)
 */
export const createDatabase = (executor: SqlExecutor): AppDatabase =>
  drizzle((sql, params, method) => executor(sql, params, method), { schema });
