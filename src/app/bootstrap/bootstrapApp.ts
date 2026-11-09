import {
  buildContentCatalog,
  type CatalogBuildResult,
  type ExerciseTypeLookup,
} from '@/features/content';
import { loadSettings } from '@/features/settings';
import type { AppDependencies } from '../dependencyTypes';
import type { AppDispatch } from '../store';

type BootstrapInput = {
  dependencies: AppDependencies;
  dispatch: AppDispatch;
  exerciseTypes: ExerciseTypeLookup;
};

/**
 * Startup sequence, before any screen mounts:
 * 1. migrate the database, 2. load settings into the store, 3. load and validate content.
 * Invalid content never fails startup; it is excluded and returned in `issues`.
 */
export async function bootstrapApp({
  dependencies,
  dispatch,
  exerciseTypes,
}: BootstrapInput): Promise<CatalogBuildResult> {
  await dependencies.storage.prepare();
  await dispatch(loadSettings()).unwrap();
  const rawPacks = await dependencies.repositories.content.loadPacks();
  const content = buildContentCatalog(rawPacks, exerciseTypes);
  if (content.issues.length > 0) {
    console.warn(`[content] ${content.issues.length} issue(s); run pnpm content:validate`);
  }
  return content;
}
