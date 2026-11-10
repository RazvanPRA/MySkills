import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/*
 * Local relational data. Every change here needs `pnpm db:generate` (a new SQL migration)
 * and a migration test proving existing rows survive.
 * Columns store primitives only; repositories validate rows with zod when reading.
 * Dates are ISO-8601 strings (sortable), local days are 'YYYY-MM-DD'.
 */

export const topicProgress = sqliteTable('topic_progress', {
  topicId: text('topic_id').primaryKey(),
  status: text('status').notNull(),
  studiedAt: text('studied_at'),
  notes: text('notes'),
  updatedAt: text('updated_at').notNull(),
});

/** FSRS state: one column per field, so "due today" is a single indexed query. */
export const reviewCards = sqliteTable(
  'review_cards',
  {
    exerciseId: text('exercise_id').primaryKey(),
    due: text('due').notNull(),
    stability: real('stability').notNull(),
    difficulty: real('difficulty').notNull(),
    scheduledDays: integer('scheduled_days').notNull(),
    learningSteps: integer('learning_steps').notNull(),
    reps: integer('reps').notNull(),
    lapses: integer('lapses').notNull(),
    state: text('state').notNull(),
    lastReview: text('last_review'),
  },
  table => [index('review_cards_due_idx').on(table.due)],
);

export const dailySessions = sqliteTable(
  'daily_sessions',
  {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    testKind: text('test_kind').notNull(),
    exerciseIds: text('exercise_ids', { mode: 'json' }).notNull(),
    status: text('status').notNull(),
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
    score: real('score'),
    /** JSON TestScope of an on-demand session ("practice this topic"); null for daily tests. */
    scope: text('scope', { mode: 'json' }),
  },
  // A daily test: same day + same test kind = the same session (reopening the app resumes
  // it). On-demand sessions have a scope and may repeat within a day.
  table => [
    uniqueIndex('daily_sessions_daily_uq')
      .on(table.date, table.testKind)
      .where(sql`${table.scope} is null`),
  ],
);

export const attempts = sqliteTable(
  'attempts',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => dailySessions.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    answer: text('answer', { mode: 'json' }).notNull(),
    result: text('result', { mode: 'json' }).notNull(),
    durationMs: integer('duration_ms').notNull(),
    confidence: integer('confidence'),
    answeredAt: text('answered_at').notNull(),
  },
  table => [
    index('attempts_session_idx').on(table.sessionId),
    index('attempts_exercise_idx').on(table.exerciseId),
    index('attempts_answered_at_idx').on(table.answeredAt),
  ],
);
