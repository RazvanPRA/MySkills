import { migrateDatabase } from '@/db';
import type { DataFilePort } from '@/features/backup';
import type { NotificationPermission, ReminderScheduler } from '@/features/notifications';
import migrations from '@/db/migrations/migrations';
import { createTestDatabase } from '@/db/testing/createTestDatabase';
import { createLocalContentRepository } from '@/features/content';
import { createLocalSettingsRepository, createMemoryKeyValueStore } from '@/features/settings';
import { fixedClock } from '@/shared/utils/clock';
import { createIdGenerator } from '@/shared/utils/idGenerator';
import { createRepositories } from '../dependencies.shared';
import type { AppDependencies } from '../dependencyTypes';
import { exerciseTypeRegistry, testRegistry } from '../registries';

/** In-memory files: saves are recorded, `openText` returns the next queued text. */
export function createMemoryFiles(opened: (string | null)[] = []) {
  const saved: { fileName: string; text: string }[] = [];
  const files: DataFilePort = {
    saveText: async file => {
      saved.push(file);
      return true;
    },
    openText: async () => opened.shift() ?? null,
  };
  return { files, saved, opened };
}

/** Records the scheduled reminder (null when cancelled); permission as given. */
export function createMemoryReminders(permission: 'granted' | 'denied' = 'granted') {
  const calls: { scheduled: Parameters<ReminderScheduler['schedule']> | null }[] = [];
  const reminders: ReminderScheduler = {
    schedule: async (time, texts) => {
      calls.push({ scheduled: [time, texts] });
    },
    cancel: async () => {
      calls.push({ scheduled: null });
    },
  };
  const notificationPermission: NotificationPermission = { request: async () => permission };
  return { reminders, notificationPermission, calls };
}

type TestDependencyOptions = {
  packs?: readonly unknown[];
  storedSettings?: Record<string, string>;
  now?: string;
  registries?: AppDependencies['registries'];
  files?: DataFilePort;
  reminders?: ReturnType<typeof createMemoryReminders>;
};

/**
 * A full container over in-memory SQLite (better-sqlite3) and an in-memory key-value store,
 * with the app's real registries unless others are given.
 */
export async function createTestDependencies(options: TestDependencyOptions = {}) {
  const { db, sqlite } = await createTestDatabase({ migrate: false });
  const clock = fixedClock(options.now ?? '2026-11-10T08:00:00.000Z');
  const dependencies: AppDependencies = {
    clock,
    generateId: createIdGenerator({ now: () => clock.now().getTime(), random: () => 0.5 }),
    files: options.files ?? createMemoryFiles().files,
    ...(options.reminders ?? createMemoryReminders()),
    storage: { prepare: () => migrateDatabase(db, migrations) },
    registries: options.registries ?? { exerciseTypes: exerciseTypeRegistry, tests: testRegistry },
    repositories: {
      ...createRepositories(db),
      content: createLocalContentRepository(options.packs ?? []),
      settings: createLocalSettingsRepository(createMemoryKeyValueStore(options.storedSettings)),
    },
  };
  return { dependencies, sqlite };
}
