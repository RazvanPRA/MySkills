import type { Attempt } from '../model/attempt';

/** Answered exercises. Local (SQLite) now, Remote later. */
export type AttemptRepository = {
  add: (attempt: Attempt) => Promise<void>;
  /** Attempts of one session, in answer order. */
  listBySession: (sessionId: string) => Promise<Attempt[]>;
  /** Attempts with `answeredAt >= since` (ISO), oldest first. */
  listSince: (since: string) => Promise<Attempt[]>;
};
