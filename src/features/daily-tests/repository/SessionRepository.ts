import type { DailySession } from '../model/dailySession';

/** Generated test sessions. Local (SQLite) now, Remote later. */
export type SessionRepository = {
  /** The session of a test kind on a given day, if it was already generated. */
  findByDateAndKind: (date: string, testKind: string) => Promise<DailySession | null>;
  getById: (id: string) => Promise<DailySession | null>;
  /** Sessions with `from <= date <= to` (YYYY-MM-DD), oldest first. */
  listBetween: (from: string, to: string) => Promise<DailySession[]>;
  /** Inserts or replaces a session (by id). */
  save: (session: DailySession) => Promise<void>;
};
