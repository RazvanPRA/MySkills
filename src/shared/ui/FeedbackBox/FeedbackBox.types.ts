import type { ReactNode } from 'react';

/** `partial` is a wrong answer with partial credit: danger bar, verdict written as text. */
export type FeedbackVerdict = 'correct' | 'wrong' | 'partial';

export type FeedbackBoxProps = {
  /** Omitted for neutral content, e.g. a flashcard's model answer (no right/wrong). */
  verdict?: FeedbackVerdict;
  /** The verdict in words ("Corect", "Parțial corect (2/3)") or a neutral heading. */
  title: string;
  children?: ReactNode;
};
