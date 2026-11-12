import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (value: string): Buffer => createHash('sha256').update(value, 'utf8').digest();

/**
 * Compares in constant time, so response timing does not reveal how much of a guess was right.
 * Hashing first gives both sides the same length, which timingSafeEqual requires, without
 * leaking the key's length through an early return.
 */
export function apiKeyMatches(expected: string, provided: string | undefined): boolean {
  if (provided === undefined || provided.length === 0) {
    return false;
  }
  return timingSafeEqual(digest(expected), digest(provided));
}
