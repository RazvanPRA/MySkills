import { createAsyncThunk } from '@reduxjs/toolkit';
import { defaultUserSettings, type SettingsRepository } from '@/features/settings';
import type { Clock } from '@/shared/utils/clock';
import { toLocalDate } from '@/shared/utils/localDate';
import type { Backup, BackupProblem, DataFilePort } from '../model/backup';
import type { UserDataRepository } from '../repository/UserDataRepository';
import { backupFileName, createBackup, parseBackup } from '../services/backupFile.service';

/** What this feature needs from the dependency container. */
export type BackupDependencies = {
  clock: Clock;
  files: DataFilePort;
  repositories: { userData: UserDataRepository; settings: SettingsRepository };
};

type ThunkConfig = { extra: BackupDependencies };

/** Writes every table and the settings to a JSON file the user picks. */
export const exportData = createAsyncThunk<'saved' | 'cancelled', void, ThunkConfig>(
  'backup/export',
  async (_, { extra }) => {
    const now = extra.clock.now();
    const [snapshot, settings] = await Promise.all([
      extra.repositories.userData.readAll(),
      extra.repositories.settings.load(),
    ]);
    const text = createBackup({ snapshot, settings, exportedAt: now.toISOString() });
    const saved = await extra.files.saveText({ fileName: backupFileName(toLocalDate(now)), text });
    return saved ? 'saved' : 'cancelled';
  },
);

export type PickedBackup =
  | { status: 'cancelled' }
  | { status: 'invalid'; problem: BackupProblem }
  | { status: 'ready'; backup: Backup };

/** Opens a file and validates it. Nothing is replaced until `restoreBackup`. */
export const pickBackup = createAsyncThunk<PickedBackup, void, ThunkConfig>(
  'backup/pick',
  async (_, { extra }) => {
    const text = await extra.files.openText();
    if (text === null) {
      return { status: 'cancelled' };
    }
    const parsed = parseBackup(text);
    return parsed.ok
      ? { status: 'ready', backup: parsed.backup }
      : { status: 'invalid', problem: parsed.problem };
  },
);

/** Replaces all data (one transaction), then the settings. */
export const restoreBackup = createAsyncThunk<void, Backup, ThunkConfig>(
  'backup/restore',
  async (backup, { extra }) => {
    const { topicProgress, reviewCards, sessions, attempts, settings } = backup;
    await extra.repositories.userData.replaceAll({
      topicProgress,
      reviewCards,
      sessions,
      attempts,
    });
    await extra.repositories.settings.save(settings);
  },
);

/** Deletes all data and returns settings to their defaults (onboarding shows again). */
export const resetData = createAsyncThunk<void, void, ThunkConfig>(
  'backup/reset',
  async (_, { extra }) => {
    await extra.repositories.userData.clearAll();
    await extra.repositories.settings.save(defaultUserSettings);
  },
);
