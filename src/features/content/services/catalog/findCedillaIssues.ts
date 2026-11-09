import { hasCedillaDiacritics } from '@/shared/i18n';
import type { ContentIssue } from '../../model/issues';
import type { Owned } from './types';

/** Every string inside a value (objects and arrays are walked recursively). */
function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

/**
 * Romanian must use comma-below ș/ț, never cedilla ş/ţ (design system §8).
 * Reported as errors; the entity stays in the catalog.
 */
export function findCedillaIssues(entities: Owned<{ id: string }>[]): ContentIssue[] {
  return entities
    .filter(entity => collectStrings(entity.value).some(hasCedillaDiacritics))
    .map(({ packId, value }) => ({
      code: 'cedilla_diacritics',
      severity: 'error',
      packId,
      entityId: value.id,
      message: 'Uses cedilla ş/ţ; replace with comma-below ș/ț',
      excluded: false,
    }));
}
