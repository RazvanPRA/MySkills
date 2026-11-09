import type { ContentCatalog } from '../model/catalog';
import type { ExerciseTypeLookup } from '../model/exerciseType';
import type { ContentIssue } from '../model/issues';
import type { Topic } from '../model/schemas';
import { dedupeById } from './catalog/dedupeById';
import { findCedillaIssues } from './catalog/findCedillaIssues';
import { findPrerequisiteCycles } from './catalog/findPrerequisiteCycles';
import { indexCatalog } from './catalog/indexCatalog';
import { type ParsedPack, parsePack } from './catalog/parsePack';
import { resolveExercises } from './catalog/resolveExercises';
import { resolveTopics } from './catalog/resolveTopics';
import type { Owned } from './catalog/types';

export type CatalogBuildResult = { catalog: ContentCatalog; issues: ContentIssue[] };

const values = <T>(items: Owned<T>[]): T[] => items.map(item => item.value);

function cycleIssues(topics: Owned<Topic>[]): ContentIssue[] {
  const graph = new Map(topics.map(({ value }) => [value.id, value.prerequisites]));
  const packOf = new Map(topics.map(({ packId, value }) => [value.id, packId]));
  return findPrerequisiteCycles(graph).map(cycle => ({
    code: 'prerequisite_cycle',
    severity: 'error',
    packId: packOf.get(cycle[0] ?? '') ?? '',
    entityId: cycle[0],
    message: `Prerequisite cycle: ${[...cycle, cycle[0]].join(' → ')}`,
    excluded: false,
  }));
}

function parseAll(rawPacks: readonly unknown[]): { packs: ParsedPack[]; issues: ContentIssue[] } {
  const parsed = rawPacks.map((raw, position) => parsePack(raw, position));
  const packs = parsed.flatMap(p => (p.pack ? [{ packId: p.pack.info.id, value: p.pack }] : []));
  const unique = dedupeById(
    packs.map(({ packId, value }) => ({ packId, value: { ...value, id: value.info.id } })),
    'pack',
  );
  return {
    packs: values(unique.values),
    issues: [...parsed.flatMap(p => p.issues), ...unique.issues],
  };
}

/**
 * Turns raw content packs into the validated catalog. Pure and total: invalid content is
 * excluded and reported in `issues`; it never throws (brief §6.1).
 */
export function buildContentCatalog(
  rawPacks: readonly unknown[],
  exerciseTypes: ExerciseTypeLookup,
): CatalogBuildResult {
  const parsed = parseAll(rawPacks);
  const categories = dedupeById(
    parsed.packs.flatMap(p => p.categories),
    'category',
  );
  const categoryIds = new Set(categories.values.map(c => c.value.id));
  const uniqueTopics = dedupeById(
    parsed.packs.flatMap(p => p.topics),
    'topic',
  );
  const topics = resolveTopics(uniqueTopics.values, categoryIds);
  const topicIds = new Set(topics.values.map(t => t.value.id));
  const uniqueExercises = dedupeById(
    parsed.packs.flatMap(p => p.exercises),
    'exercise',
  );
  const exercises = resolveExercises(uniqueExercises.values, topicIds, exerciseTypes);
  const all = [...categories.values, ...topics.values, ...exercises.values];
  const catalog = indexCatalog({
    packs: parsed.packs.map(p => p.info),
    categories: values(categories.values),
    topics: values(topics.values),
    exercises: values(exercises.values),
  });
  const issues = [
    ...parsed.issues,
    ...categories.issues,
    ...uniqueTopics.issues,
    ...topics.issues,
    ...cycleIssues(topics.values),
    ...uniqueExercises.issues,
    ...exercises.issues,
    ...findCedillaIssues(all),
  ];
  return { catalog, issues };
}
