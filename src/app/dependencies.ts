import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrateDatabase } from '@/db';
import migrations from '@/db/migrations/migrations';
import { openDeviceDatabase } from '@/db/openDeviceDatabase';
import { createLocalContentRepository } from '@/features/content';
import { createLocalSettingsRepository } from '@/features/settings';
import { systemClock } from '@/shared/utils/clock';
import { createIdGenerator } from '@/shared/utils/idGenerator';
import { createRepositories } from './dependencies.shared';
import { createAndroidDataFiles } from './native/dataFiles';
import type { AppDependencies } from './dependencyTypes';
import { exerciseTypeRegistry, testRegistry } from './registries';

/**
 * The only place where concrete implementations are chosen (Local* today, Remote* later).
 * Imports native modules, so only App.tsx uses it; tests build their own container.
 */
export function createDependencies(): AppDependencies {
  const db = openDeviceDatabase();
  return {
    clock: systemClock,
    generateId: createIdGenerator({ now: () => systemClock.now().getTime(), random: Math.random }),
    files: createAndroidDataFiles(),
    storage: { prepare: () => migrateDatabase(db, migrations) },
    registries: { exerciseTypes: exerciseTypeRegistry, tests: testRegistry },
    repositories: {
      ...createRepositories(db),
      content: createLocalContentRepository(),
      settings: createLocalSettingsRepository(AsyncStorage),
    },
  };
}
