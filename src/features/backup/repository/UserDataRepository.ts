import type { UserDataSnapshot } from '../model/backup';

/** All the user's relational data at once (export, import, reset). Local now, Remote later. */
export type UserDataRepository = {
  readAll: () => Promise<UserDataSnapshot>;
  /** Replaces every table in one transaction: all of it or nothing. */
  replaceAll: (snapshot: UserDataSnapshot) => Promise<void>;
  /** Deletes everything in one transaction. */
  clearAll: () => Promise<void>;
};
