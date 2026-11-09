import Database from 'better-sqlite3';
import { createDatabase } from '../database';
import { type SqlExecutor, shapeRows } from '../executor';
import { migrateDatabase } from '../migrate';
import migrations from '../migrations/migrations';

/** Executor over better-sqlite3, for tests in Node. Same contract as the op-sqlite one. */
export const betterSqliteExecutor =
  (sqlite: Database.Database): SqlExecutor =>
  async (sql, params, method) => {
    const statement = sqlite.prepare(sql);
    if (method === 'run' || !statement.reader) {
      statement.run(...params);
      return { rows: [] };
    }
    return shapeRows(statement.raw().all(...params) as unknown[][], method);
  };

/** An in-memory database, optionally migrated with the app's real migrations. */
export async function createTestDatabase({ migrate = true } = {}) {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = createDatabase(betterSqliteExecutor(sqlite));
  if (migrate) {
    await migrateDatabase(db, migrations);
  }
  return { db, sqlite };
}
