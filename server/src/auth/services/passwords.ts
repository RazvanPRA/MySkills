import * as argon2 from 'argon2';

/** argon2id with the library's defaults (OWASP-recommended memory-hard parameters). */
export const hashPassword = (password: string): Promise<string> =>
  argon2.hash(password, { type: argon2.argon2id });

export const verifyPassword = (hash: string, password: string): Promise<boolean> =>
  argon2.verify(hash, password).catch(() => false);

/**
 * Verified when the email is unknown, so "no such user" takes as long as "wrong password" and
 * response times do not reveal which emails have accounts.
 */
let dummyHash: Promise<string> | null = null;
export const dummyPasswordHash = (): Promise<string> =>
  (dummyHash ??= hashPassword('not-a-real-password-for-timing'));
