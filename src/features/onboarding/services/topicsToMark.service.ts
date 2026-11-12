import type { ContentCatalog } from '@/features/content';
import type { SelfAssessment } from '@/features/settings';
import { levels } from '@/shared/domain';

/**
 * Pure: the topics a self-assessment marks as studied. "Mid" in a category means its Junior
 * and Mid topics. Only categories that feed the knowledge test; "none" marks nothing.
 */
export function topicsToMark(
  catalog: ContentCatalog,
  assessment: Readonly<Record<string, SelfAssessment>>,
): string[] {
  return catalog.categories.flatMap(category => {
    const level = assessment[category.id] ?? 'none';
    if (level === 'none' || !category.testKinds.includes('knowledge')) {
      return [];
    }
    const rank = levels.indexOf(level);
    return (catalog.topicsByCategory.get(category.id) ?? [])
      .filter(topic => levels.indexOf(topic.level) <= rank)
      .map(topic => topic.id);
  });
}

/** Categories offered for self-assessment: the ones whose topics can be marked. */
export const assessableCategories = (catalog: ContentCatalog) =>
  catalog.categories.filter(category => category.testKinds.includes('knowledge'));
