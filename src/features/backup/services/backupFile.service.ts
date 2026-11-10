import type { UserSettings } from '@/features/settings';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type Backup,
  type BackupProblem,
  backupSchema,
  type UserDataSnapshot,
} from '../model/backup';

/** "senior-prep-2026-11-10.json" */
export const backupFileName = (day: string): string => `senior-prep-${day}.json`;

export function createBackup(input: {
  snapshot: UserDataSnapshot;
  settings: UserSettings;
  exportedAt: string;
}): string {
  const backup: Backup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: input.exportedAt,
    settings: input.settings,
    ...input.snapshot,
  };
  return JSON.stringify(backup, null, 2);
}

export type ParsedBackup = { ok: true; backup: Backup } | { ok: false; problem: BackupProblem };

function decode(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

/** Every attempt belongs to a session in the same file (the database enforces it too). */
const attemptsHaveSessions = (backup: Backup): boolean => {
  const sessionIds = new Set(backup.sessions.map(session => session.id));
  return backup.attempts.every(attempt => sessionIds.has(attempt.sessionId));
};

/**
 * Pure: validates a backup file before anything is replaced. Explains what is wrong instead
 * of throwing: not JSON, not ours, made by a newer app, or damaged.
 */
export function parseBackup(text: string): ParsedBackup {
  const data = decode(text);
  if (data === undefined) {
    return { ok: false, problem: 'not_json' };
  }
  const header = data as { format?: unknown; version?: unknown } | null;
  if (header?.format !== BACKUP_FORMAT) {
    return { ok: false, problem: 'not_backup' };
  }
  if (typeof header.version === 'number' && header.version > BACKUP_VERSION) {
    return { ok: false, problem: 'newer_version' };
  }
  const parsed = backupSchema.safeParse(data);
  if (!parsed.success || !attemptsHaveSessions(parsed.data)) {
    return { ok: false, problem: 'invalid' };
  }
  return { ok: true, backup: parsed.data };
}
