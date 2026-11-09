import type { ContentIssue } from '../../model/issues';

/** A content entity together with the pack it came from (for issue reporting). */
export type Owned<T> = { packId: string; value: T };

/** Every catalog step returns what survived plus what it found wrong. */
export type StepResult<T> = { values: T[]; issues: ContentIssue[] };
