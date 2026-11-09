import type { DB, Scalar } from '@op-engineering/op-sqlite';
import { type SqlExecutor, shapeRows } from './executor';

/** Executor over op-sqlite (async, runs off the JS thread). */
export const opSqliteExecutor =
  (db: Pick<DB, 'execute' | 'executeRaw'>): SqlExecutor =>
  async (sql, params, method) => {
    const values = params as Scalar[];
    if (method === 'run') {
      await db.execute(sql, values);
      return { rows: [] };
    }
    const { rawRows } = await db.executeRaw(sql, values);
    return shapeRows(rawRows, method);
  };
