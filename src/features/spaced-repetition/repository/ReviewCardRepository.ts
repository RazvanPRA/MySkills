import type { ReviewCard } from '../model/reviewCard';

/** FSRS state per exercise. Local (SQLite) now, Remote later. */
export type ReviewCardRepository = {
  getAll: () => Promise<ReviewCard[]>;
  get: (exerciseId: string) => Promise<ReviewCard | null>;
  /** Cards with `due <= until`, most overdue first. */
  getDue: (until: string) => Promise<ReviewCard[]>;
  save: (card: ReviewCard) => Promise<void>;
};
