import type { ContentCatalog, Topic } from '@/features/content';
import { type Level, levels, resolveText } from '@/shared/domain';
import type { Language } from '@/shared/i18n';

/** Unicode combining diacritical marks, left over by NFD ("ă" → "a" + U+0306). */
const DIACRITICS = { first: 0x0300, last: 0x036f };

const isDiacritic = (char: string): boolean => {
  const code = char.codePointAt(0) ?? 0;
  return code >= DIACRITICS.first && code <= DIACRITICS.last;
};

/** Lowercase, without diacritics: "acțiune" matches "Actiune", "Hooks" matches "hooks". */
export const normalizeSearch = (text: string): string =>
  [...text.normalize('NFD')]
    .filter(char => !isDiacritic(char))
    .join('')
    .toLowerCase()
    .trim();

/** Every word of the query appears in the title or the tags. */
function matches(topic: Topic, words: readonly string[], language: Language): boolean {
  const haystack = normalizeSearch(
    [resolveText(topic.title, language).text, ...topic.tags].join(' '),
  );
  return words.every(word => haystack.includes(word));
}

export type TopicGroup = {
  /** A level (browsing a category) or a category id (searching everywhere). */
  key: string;
  kind: 'level' | 'category';
  topics: Topic[];
};

export type StudyQuery = {
  catalog: ContentCatalog;
  categoryId: string | null;
  levels: readonly Level[];
  query: string;
  language: Language;
};

/**
 * Pure: without a search, the selected category's topics by level (Junior → Mid → Senior).
 * With a search, matching topics of every category, grouped by category in catalog order.
 * The level filter applies to both; empty groups are left out.
 */
export function groupStudyTopics(input: StudyQuery): TopicGroup[] {
  const { catalog, categoryId, query, language } = input;
  const allowed = new Set(input.levels);
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    const topics = categoryId ? catalog.topicsByCategory.get(categoryId) ?? [] : [];
    return levels
      .filter(level => allowed.has(level))
      .map(level => ({
        key: level,
        kind: 'level' as const,
        topics: topics.filter(topic => topic.level === level),
      }))
      .filter(group => group.topics.length > 0);
  }
  return catalog.categories
    .map(category => ({
      key: category.id,
      kind: 'category' as const,
      topics: (catalog.topicsByCategory.get(category.id) ?? []).filter(
        topic => allowed.has(topic.level) && matches(topic, words, language),
      ),
    }))
    .filter(group => group.topics.length > 0);
}

/** Adds or removes a level from the filter, keeping Junior → Mid → Senior order. */
export const toggleLevel = (selected: readonly Level[], level: Level): Level[] =>
  selected.includes(level)
    ? selected.filter(item => item !== level)
    : levels.filter(item => item === level || selected.includes(item));
