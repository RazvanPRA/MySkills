import { useMemo } from 'react';
import { useContentCatalog } from '@/features/content';
import { useSettings } from '@/features/settings';
import { useLanguage, useStrings } from '@/shared/i18n';
import { accuracyByWeek, fromFirstAnsweredWeek } from '../services/accuracy.service';
import { buildHeatmap } from '../services/buildHeatmap.service';
import { presentMasteryTable } from '../services/presentMasteryTable';
import {
  logicAttempts,
  presentHistory,
  presentWeakTopics,
  presentWeeks,
} from '../services/presentProgressLists';
import { weakTopics } from '../services/weakTopics.service';
import { selectProgress } from '../state/selectors';
import { useProgressSelector } from '../state/hooks';
import { useProgressData } from './useProgressData';

/** Weeks of logic accuracy shown on Progress. */
const LOGIC_WEEKS = 8;

/** Everything the Progress tab shows (brief §9.7), already translated. */
export function useProgressScreen() {
  const catalog = useContentCatalog();
  const strings = useStrings();
  const language = useLanguage();
  const { status, mastery, reload } = useProgressData();
  const { attempts, sessions, today, testTitles } = useProgressSelector(selectProgress);
  const { selfAssessment } = useSettings().settings;

  const sections = useMemo(() => {
    const context = { catalog, strings, language };
    const weeks =
      today === null
        ? []
        : accuracyByWeek(logicAttempts(catalog, attempts), { today, weeks: LOGIC_WEEKS });
    return {
      table: presentMasteryTable(buildHeatmap(catalog, mastery), { ...context, selfAssessment }),
      weeks: presentWeeks(fromFirstAnsweredWeek(weeks), context),
      weak: presentWeakTopics(weakTopics(catalog, mastery), context),
      history: presentHistory(sessions, { ...context, testTitles }),
    };
  }, [catalog, strings, language, attempts, sessions, today, testTitles, mastery, selfAssessment]);
  return { status, reload, ...sections };
}
