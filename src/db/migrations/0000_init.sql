CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`answer` text NOT NULL,
	`result` text NOT NULL,
	`duration_ms` integer NOT NULL,
	`confidence` integer,
	`answered_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `daily_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attempts_session_idx` ON `attempts` (`session_id`);--> statement-breakpoint
CREATE INDEX `attempts_exercise_idx` ON `attempts` (`exercise_id`);--> statement-breakpoint
CREATE INDEX `attempts_answered_at_idx` ON `attempts` (`answered_at`);--> statement-breakpoint
CREATE TABLE `daily_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`test_kind` text NOT NULL,
	`exercise_ids` text NOT NULL,
	`status` text NOT NULL,
	`started_at` text,
	`completed_at` text,
	`score` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_sessions_date_kind_uq` ON `daily_sessions` (`date`,`test_kind`);--> statement-breakpoint
CREATE TABLE `review_cards` (
	`exercise_id` text PRIMARY KEY NOT NULL,
	`due` text NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`scheduled_days` integer NOT NULL,
	`learning_steps` integer NOT NULL,
	`reps` integer NOT NULL,
	`lapses` integer NOT NULL,
	`state` text NOT NULL,
	`last_review` text
);
--> statement-breakpoint
CREATE INDEX `review_cards_due_idx` ON `review_cards` (`due`);--> statement-breakpoint
CREATE TABLE `topic_progress` (
	`topic_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`studied_at` text,
	`notes` text,
	`updated_at` text NOT NULL
);
