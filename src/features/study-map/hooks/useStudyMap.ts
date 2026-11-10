import { useCallback, useMemo, useState } from 'react';
import { useContentCatalog } from '@/features/content';
import { useSettings } from '@/features/settings';
import { type Level, resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { groupStudyTopics, toggleLevel } from '../services/filterTopics.service';
import { presentStudySections } from '../services/presentStudySections';
import { selectTopicProgressById } from '../state/selectors';
import { useStudyMapSelector } from '../state/hooks';

/**
 * The study map (design system §6.3): category tabs, a level filter and a search over every
 * category. Category and levels are saved in settings, so they survive restarts.
 */
export function useStudyMap() {
  const catalog = useContentCatalog();
  const language = useLanguage();
  const strings = useStrings();
  const progress = useStudyMapSelector(selectTopicProgressById);
  const { settings, update } = useSettings();
  const [query, setQuery] = useState('');
  const { studyCategoryId, studyLevels } = settings;
  const selectedId = catalog.categoriesById.has(studyCategoryId ?? '')
    ? studyCategoryId
    : catalog.categories[0]?.id ?? null;

  const select = useCallback((id: string) => update({ studyCategoryId: id }), [update]);
  const toggle = useCallback(
    (level: string) => update({ studyLevels: toggleLevel(studyLevels, level as Level) }),
    [studyLevels, update],
  );
  const tabs = useMemo(
    () => catalog.categories.map(c => ({ id: c.id, label: resolveText(c.title, language).text })),
    [catalog, language],
  );
  const sections = useMemo(() => {
    const groups = groupStudyTopics({
      catalog,
      categoryId: selectedId,
      levels: studyLevels,
      query,
      language,
    });
    return presentStudySections(groups, { catalog, strings, language, progress });
  }, [catalog, selectedId, studyLevels, query, language, strings, progress]);

  return {
    tabs,
    selectedId,
    select,
    levels: studyLevels,
    toggleLevel: toggle,
    query,
    setQuery,
    searching: query.trim().length > 0,
    sections,
  };
}
