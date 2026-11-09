import type { z } from 'zod';

export type InvalidRowHandler = (table: string, error: z.ZodError, row: unknown) => void;

/** Converts SQL NULLs to undefined, so rows match optional fields in domain schemas. */
export function nullsToUndefined<T extends Record<string, unknown>>(
  row: T,
): { [K in keyof T]: Exclude<T[K], null> | undefined } {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value === null ? undefined : value]),
  ) as { [K in keyof T]: Exclude<T[K], null> | undefined };
}

type ParseOptions<T> = { table: string; schema: z.ZodType<T>; onInvalid?: InvalidRowHandler };

/**
 * Validates rows read from storage. Invalid rows are skipped and reported instead of
 * crashing the screen that reads them (data crossing a boundary is never trusted).
 */
export function parseRows<T>(rows: Record<string, unknown>[], options: ParseOptions<T>): T[] {
  return rows.flatMap(row => {
    const parsed = options.schema.safeParse(nullsToUndefined(row));
    if (parsed.success) {
      return [parsed.data];
    }
    options.onInvalid?.(options.table, parsed.error, row);
    return [];
  });
}
