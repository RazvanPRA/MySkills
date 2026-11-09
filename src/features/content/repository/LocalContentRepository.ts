import { bundledPacks } from '@content/packs/index.generated';
import type { ContentRepository } from './ContentRepository';

/** Packs bundled with the app (content/packs/*.json, listed by `pnpm content:index`). */
export function createLocalContentRepository(
  packs: readonly unknown[] = bundledPacks,
): ContentRepository {
  return { loadPacks: async () => packs };
}
