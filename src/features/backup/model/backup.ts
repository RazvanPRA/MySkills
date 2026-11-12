import { z } from 'zod';
import { attemptSchema } from '@/features/session-player';
import { dailySessionSchema } from '@/features/daily-tests';
import { userSettingsSchema } from '@/features/settings';
import { reviewCardSchema } from '@/features/spaced-repetition';
import { topicProgressSchema } from '@/features/study-map';
import { isoDateTimeSchema } from '@/shared/domain';

/** Identifies our files; anything else is rejected before it can replace data. */
export const BACKUP_FORMAT = 'senior-prep-backup';
/** Bumped with an explicit migration when the file shape changes. */
export const BACKUP_VERSION = 1;

/** Everything the user created, in every table. */
export const userDataSnapshotSchema = z.object({
  topicProgress: z.array(topicProgressSchema),
  reviewCards: z.array(reviewCardSchema),
  sessions: z.array(dailySessionSchema),
  attempts: z.array(attemptSchema),
});
export type UserDataSnapshot = z.infer<typeof userDataSnapshotSchema>;

export const backupSchema = userDataSnapshotSchema.extend({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: isoDateTimeSchema,
  settings: userSettingsSchema,
});
export type Backup = z.infer<typeof backupSchema>;

export type BackupProblem = 'not_json' | 'not_backup' | 'newer_version' | 'invalid';

/** Reads and writes a text file the user picks (Android: the system file dialogs). */
export type DataFilePort = {
  /** Resolves false when the user cancels the dialog. */
  saveText: (file: { fileName: string; text: string }) => Promise<boolean>;
  /** The file's text, or null when the user cancels. */
  openText: () => Promise<string | null>;
};
