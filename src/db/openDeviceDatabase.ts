import { open } from '@op-engineering/op-sqlite';
import { type AppDatabase, createDatabase } from './database';
import { opSqliteExecutor } from './opSqliteExecutor';

export const DATABASE_NAME = 'seniorprep.db';

/**
 * Opens the app database on the device with foreign keys and WAL enabled.
 * Imported only by src/app/dependencies.ts (native module, not available in Jest).
 */
export function openDeviceDatabase(name: string = DATABASE_NAME): AppDatabase {
  const connection = open({ name });
  connection.executeSync('PRAGMA foreign_keys = ON');
  connection.executeSync('PRAGMA journal_mode = WAL');
  return createDatabase(opSqliteExecutor(connection));
}
