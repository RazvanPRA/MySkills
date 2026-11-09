import type { Owned, StepResult } from './types';

/** Keeps the first entity with a given id; later duplicates are excluded and reported. */
export function dedupeById<T extends { id: string }>(
  items: Owned<T>[],
  kind: string,
): StepResult<Owned<T>> {
  const firstPackById = new Map<string, string>();
  const result: StepResult<Owned<T>> = { values: [], issues: [] };
  for (const item of items) {
    const firstPack = firstPackById.get(item.value.id);
    if (firstPack === undefined) {
      firstPackById.set(item.value.id, item.packId);
      result.values.push(item);
      continue;
    }
    result.issues.push({
      code: 'duplicate_id',
      severity: 'error',
      packId: item.packId,
      entityId: item.value.id,
      message: `Duplicate ${kind} id (first defined in pack "${firstPack}")`,
      excluded: true,
    });
  }
  return result;
}
