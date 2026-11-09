import type { ContentIssue } from '../../model/issues';
import type { Topic } from '../../model/schemas';
import type { Owned, StepResult } from './types';

/**
 * Drops topics whose category does not exist, and strips prerequisites that point
 * to unknown topics (the topic itself stays usable).
 */
export function resolveTopics(
  topics: Owned<Topic>[],
  categoryIds: ReadonlySet<string>,
): StepResult<Owned<Topic>> {
  const known = topics.filter(t => categoryIds.has(t.value.categoryId));
  const topicIds = new Set(known.map(t => t.value.id));
  const issues: ContentIssue[] = topics
    .filter(t => !categoryIds.has(t.value.categoryId))
    .map(({ packId, value }) => ({
      code: 'unknown_category',
      severity: 'error',
      packId,
      entityId: value.id,
      message: `Unknown categoryId "${value.categoryId}"`,
      excluded: true,
    }));

  const values = known.map(({ packId, value }) => {
    const missing = value.prerequisites.filter(id => !topicIds.has(id));
    missing.forEach(id =>
      issues.push({
        code: 'unknown_prerequisite',
        severity: 'error',
        packId,
        entityId: value.id,
        message: `Unknown prerequisite "${id}" (ignored)`,
        excluded: false,
      }),
    );
    const prerequisites = value.prerequisites.filter(id => topicIds.has(id));
    return { packId, value: missing.length ? { ...value, prerequisites } : value };
  });
  return { values, issues };
}
