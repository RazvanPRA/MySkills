import type { ContentCatalog } from '@/features/content';
import type { Attempt } from '@/features/session-player';
import type { UserSettings } from '@/features/settings';
import type { ReviewCard } from '@/features/spaced-repetition';
import type { TopicProgress } from '@/features/study-map';
import type { LocalizedText } from '@/shared/domain';

export type TestSchedule = 'daily' | 'weekly' | 'on_demand';

/** `mark_topics`: the pool grows when more topics are marked as covered in Study. */
export type ShortfallRemedy = 'mark_topics';

export type TestItemKind = 'question' | 'problem';

/** Narrows an on-demand session ("Practice this topic only"). Ignored by daily tests. */
export type TestScope = { topicIds?: readonly string[]; categoryIds?: readonly string[] };

/** Everything a test needs to build a session. No clock, no randomness, no I/O. */
export type TestBuildContext = {
  /** YYYY-MM-DD, local time zone. */
  date: string;
  /** hash(date + kind): the same day always gives the same test. */
  seed: number;
  catalog: ContentCatalog;
  progress: readonly TopicProgress[];
  reviewCards: readonly ReviewCard[];
  /**
   * Attempts from the last 30 days (the logic test's no-repeat window). Each test narrows it to
   * what it needs with `attemptsSince` (knowledge: 14 days, logic accuracy: 7).
   */
  recentAttempts: readonly Attempt[];
  settings: UserSettings;
  scope?: TestScope;
};

export type SessionPlan = {
  exerciseIds: string[];
  /** Present when the pool was too small for a full test (brief §7.1.6). */
  shortfall?: {
    target: number;
    available: number;
    /** What the user can do about it; none when only more content would help. */
    remedy?: ShortfallRemedy;
  };
};

/**
 * Contract of a test type (brief §6.2). Each lives in src/features/test-definitions/<kind>/
 * and is registered only in src/app/registries.ts. Every daily test gets a card on Today.
 */
export type TestDefinition = {
  kind: string;
  title: LocalizedText;
  schedule: TestSchedule;
  /**
   * Whether answers update the exercises' FSRS cards. True for knowledge tests; false for
   * the logic test, which avoids repeats with its own 30-day rule.
   */
  spacedRepetition: boolean;
  /** What Today counts: "10 întrebări" (default) or "5 probleme" (design system §6.3). */
  itemKind?: TestItemKind;
  /** Pure and deterministic for a given context. */
  buildSession: (context: TestBuildContext) => SessionPlan;
};
