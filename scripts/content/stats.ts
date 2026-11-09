import type { ContentCatalog } from '@/features/content';
import { type Level, levels } from '@/shared/domain';

/** Brief §10: at least 15 exercises per category (60 for logic). */
export const MIN_EXERCISES_PER_CATEGORY = 15;
export const MIN_LOGIC_EXERCISES = 60;

export type CategoryStats = {
  categoryId: string;
  topics: number;
  byLevel: Record<Level, number>;
  byType: Record<string, number>;
  total: number;
  target: number;
};

function statsFor(catalog: ContentCatalog, categoryId: string): CategoryStats {
  const topics = catalog.topicsByCategory.get(categoryId) ?? [];
  const exercises = topics.flatMap(topic => catalog.exercisesByTopic.get(topic.id) ?? []);
  const byLevel = Object.fromEntries(levels.map(level => [level, 0])) as Record<Level, number>;
  const byType: Record<string, number> = {};
  for (const exercise of exercises) {
    byLevel[exercise.level] += 1;
    byType[exercise.type] = (byType[exercise.type] ?? 0) + 1;
  }
  const isLogic = catalog.categoriesById.get(categoryId)?.testKinds.includes('logic') ?? false;
  return {
    categoryId,
    topics: topics.length,
    byLevel,
    byType,
    total: exercises.length,
    target: isLogic ? MIN_LOGIC_EXERCISES : MIN_EXERCISES_PER_CATEGORY,
  };
}

/** Exercise counts per category × level × type, in category order. */
export const computeStats = (catalog: ContentCatalog): CategoryStats[] =>
  catalog.categories.map(category => statsFor(catalog, category.id));

const pad = (value: string | number, width: number) => String(value).padEnd(width);

export function renderStats(stats: CategoryStats[]): string {
  const width = Math.max(10, ...stats.map(row => row.categoryId.length)) + 2;
  const header = `${pad('category', width)}${pad('topics', 8)}${pad('junior', 8)}${pad(
    'mid',
    8,
  )}${pad('senior', 8)}${pad('total', 12)}types`;
  const rows = stats.map(row => {
    const flag = row.total < row.target ? ` ✖<${row.target}` : ' ✔';
    const types = Object.entries(row.byType)
      .map(([type, count]) => `${type}:${count}`)
      .join(' ');
    const { junior, mid, senior } = row.byLevel;
    return `${pad(row.categoryId, width)}${pad(row.topics, 8)}${pad(junior, 8)}${pad(mid, 8)}${pad(
      senior,
      8,
    )}${pad(`${row.total}${flag}`, 12)}${types || '-'}`;
  });
  const missing = stats.filter(row => row.total < row.target).length;
  return [header, ...rows, '', `${missing} of ${stats.length} categories below target`].join('\n');
}
