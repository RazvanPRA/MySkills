import type { DailySession, TestScope } from '../model/dailySession';

/** Generated test sessions. Local (SQLite) now, Remote later. */
export type SessionRepository = {
  /** The daily session (no scope) of a test kind on a given day, if already generated. */
  findByDateAndKind: (date: string, testKind: string) => Promise<DailySession | null>;
  /** The latest unfinished on-demand session with exactly this scope on a day (to resume). */
  findOpenByScope: (query: {
    date: string;
    testKind: string;
    scope: TestScope;
  }) => Promise<DailySession | null>;
  getById: (id: string) => Promise<DailySession | null>;
  /** Sessions with `from <= date <= to` (YYYY-MM-DD), oldest first. */
  listBetween: (from: string, to: string) => Promise<DailySession[]>;
  /** Inserts or replaces a session (by id). */
  save: (session: DailySession) => Promise<void>;
};
