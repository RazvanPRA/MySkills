import { migrateDatabase } from '@/db';
import migrations from '@/db/migrations/migrations';
import { createTestDatabase } from '@/db/testing/createTestDatabase';
import { createLocalContentRepository } from '@/features/content';
import { createLocalSettingsRepository, createMemoryKeyValueStore } from '@/features/settings';
import { fixedClock } from '@/shared/utils/clock';
import { createIdGenerator } from '@/shared/utils/idGenerator';
import { createRepositories } from '../dependencies.shared';
import type { AppDependencies } from '../dependencyTypes';

type TestDependencyOptions = {
  packs?: readonly unknown[];
  storedSettings?: Record<string, string>;
  now?: string;
};

/** A full container over in-memory SQLite (better-sqlite3) and an in-memory key-value store. */
export async function createTestDependencies(options: TestDependencyOptions = {}) {
  const { db, sqlite } = await createTestDatabase({ migrate: false });
  const clock = fixedClock(options.now ?? '2026-11-10T08:00:00.000Z');
  const dependencies: AppDependencies = {
    clock,
    generateId: createIdGenerator({ now: () => clock.now().getTime(), random: () => 0.5 }),
    storage: { prepare: () => migrateDatabase(db, migrations) },
    repositories: {
      ...createRepositories(db),
      content: createLocalContentRepository(options.packs ?? []),
      settings: createLocalSettingsRepository(createMemoryKeyValueStore(options.storedSettings)),
    },
  };
  return { dependencies, sqlite };
}
