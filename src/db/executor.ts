export type SqlMethod = 'run' | 'all' | 'values' | 'get';

/**
 * Runs one SQL statement for Drizzle's sqlite-proxy driver.
 * Contract: `run` → rows [], `all`/`values` → rows as arrays of column values,
 * `get` → the first row's values (or undefined when there is none).
 *
 * One interface, two implementations: op-sqlite on the device, better-sqlite3 in tests.
 * Both go through the same Drizzle driver and the same migration runner.
 */
export type SqlExecutor = (
  sql: string,
  params: unknown[],
  method: SqlMethod,
) => Promise<{ rows: unknown[] }>;

/** Shapes raw rows according to the sqlite-proxy contract. */
export function shapeRows(rows: unknown[][], method: SqlMethod): { rows: unknown[] } {
  if (method === 'get') {
    // sqlite-proxy reads the single row from `rows` itself.
    return { rows: rows[0] as unknown[] };
  }
  return { rows: method === 'run' ? [] : rows };
}
