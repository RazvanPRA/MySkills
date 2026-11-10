DROP INDEX `daily_sessions_date_kind_uq`;--> statement-breakpoint
ALTER TABLE `daily_sessions` ADD `scope` text;--> statement-breakpoint
CREATE UNIQUE INDEX `daily_sessions_daily_uq` ON `daily_sessions` (`date`,`test_kind`) WHERE "daily_sessions"."scope" is null;