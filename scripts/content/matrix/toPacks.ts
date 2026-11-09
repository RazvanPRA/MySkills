import { isDeepStrictEqual } from 'node:util';
import { type Category, CURRENT_CONTENT_SCHEMA_VERSION, type Topic } from '@/features/content';
import { levels } from '@/shared/domain';
import type { MatrixCategory, MatrixPack, MatrixRow } from './types';

/** A pack generated from the matrix. Exercises are hand-written and carried over untouched. */
export type GeneratedPack = {
  id: string;
  version: string;
  schemaVersion: number;
  title: { ro: string };
  categories: Category[];
  topics: Topic[];
  exercises: unknown[];
};

/** What is kept from the pack file currently on disk. */
export type ExistingPack = Pick<GeneratedPack, 'version' | 'categories' | 'topics' | 'exercises'>;

export const INITIAL_PACK_VERSION = '1.0.0';
const CATEGORY_ORDER_STEP = 10;

export const toTopicId = (categoryId: string, rowId: string, level: string) =>
  `${categoryId}.${rowId}.${level}`;

/** One topic per filled level; each level requires the previous filled level of the same row. */
function rowTopics(categoryId: string, row: MatrixRow): Topic[] {
  const topics: Topic[] = [];
  for (const level of levels) {
    const summary = row.cells[level];
    if (summary) {
      const previous = topics[topics.length - 1];
      topics.push({
        id: toTopicId(categoryId, row.id, level),
        categoryId,
        title: { ro: row.title },
        level,
        summary: { ro: summary },
        resources: row.resources,
        tags: [row.id],
        prerequisites: previous ? [previous.id] : [],
      });
    }
  }
  return topics;
}

const toCategory = (category: MatrixCategory, order: number): Category => ({
  id: category.id,
  title: { ro: category.title },
  testKinds: ['knowledge'],
  order,
});

/** "1.4.2" → "1.5.0": new or changed topics are a backwards-compatible content change. */
export function bumpMinor(version: string): string {
  const [major = '1', minor = '0'] = version.split('.');
  return `${major}.${Number(minor) + 1}.0`;
}

function nextVersion(existing: ExistingPack | undefined, content: ExistingPack): string {
  if (!existing) {
    return INITIAL_PACK_VERSION;
  }
  const unchanged =
    isDeepStrictEqual(existing.categories, content.categories) &&
    isDeepStrictEqual(existing.topics, content.topics);
  return unchanged ? existing.version : bumpMinor(existing.version);
}

/**
 * Turns the parsed matrix into content packs. Category order follows the document.
 * `existing` maps pack id → the pack on disk, whose exercises are preserved.
 */
export function matrixToPacks(
  packs: MatrixPack[],
  existing: ReadonlyMap<string, ExistingPack>,
): GeneratedPack[] {
  let order = 0;
  return packs.map(pack => {
    const categories = pack.categories.map(category => {
      order += CATEGORY_ORDER_STEP;
      return toCategory(category, order);
    });
    const topics = pack.categories.flatMap(category =>
      category.rows.flatMap(row => rowTopics(category.id, row)),
    );
    const previous = existing.get(pack.id);
    const exercises = previous?.exercises ?? [];
    return {
      id: pack.id,
      version: nextVersion(previous, { version: '', categories, topics, exercises }),
      schemaVersion: CURRENT_CONTENT_SCHEMA_VERSION,
      title: { ro: pack.title },
      categories,
      topics,
      exercises,
    };
  });
}
