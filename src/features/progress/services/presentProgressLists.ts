import type { ContentCatalog } from '@/features/content';
import { type LocalizedText, resolveText } from '@/shared/domain';
import { formatShortDate, type Language, type Strings } from '@/shared/i18n';
import type { AttemptFact, SessionFact } from '../model/facts';
import type { WeekAccuracy } from './accuracy.service';
import type { WeakTopic } from './weakTopics.service';

type Context = { catalog: ContentCatalog; strings: Strings; language: Language };

export type LinkItem = { id: string; title: string; meta: string };
export type WeekModel = { weekStart: string; title: string; progress: number; text: string };

/** Attempts on exercises of categories that feed the logic test. */
export function logicAttempts(catalog: ContentCatalog, attempts: readonly AttemptFact[]) {
  const isLogic = (exerciseId: string) => {
    const topic = catalog.topicsById.get(catalog.exercisesById.get(exerciseId)?.topicId ?? '');
    return (
      catalog.categoriesById.get(topic?.categoryId ?? '')?.testKinds.includes('logic') ?? false
    );
  };
  return attempts.filter(attempt => isLogic(attempt.exerciseId));
}

export function presentWeeks(
  weeks: readonly WeekAccuracy[],
  { strings, language }: Context,
): WeekModel[] {
  const { logic } = strings.progress;
  return weeks.map(week => ({
    weekStart: week.weekStart,
    title: logic.week(formatShortDate(week.weekStart, language)),
    progress: (week.accuracy ?? 0) / 100,
    text:
      week.accuracy === null
        ? logic.noAnswers
        : `${week.accuracy}% · ${strings.counts.answers(week.count)}`,
  }));
}

export function presentWeakTopics(
  weak: readonly WeakTopic[],
  { catalog, strings, language }: Context,
): LinkItem[] {
  return weak.flatMap(({ topicId, mastery }) => {
    const topic = catalog.topicsById.get(topicId);
    if (!topic) {
      return [];
    }
    const category = catalog.categoriesById.get(topic.categoryId);
    const meta = [
      strings.progress.weak.mastery(mastery),
      category && resolveText(category.title, language).text,
      strings.levels[topic.level],
    ];
    return [
      {
        id: topicId,
        title: resolveText(topic.title, language).text,
        meta: meta.filter(Boolean).join(' · '),
      },
    ];
  });
}

export type HistoryContext = Context & {
  testTitles: Readonly<Record<string, LocalizedText>>;
  limit?: number;
};

/** Finished tests, newest first: "Test de logică" · "9 nov. · 80%". */
export function presentHistory(
  sessions: readonly SessionFact[],
  context: HistoryContext,
): LinkItem[] {
  const { testTitles, language, limit = 10 } = context;
  return sessions
    .filter(session => session.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date) || a.testKind.localeCompare(b.testKind))
    .slice(0, limit)
    .map(session => {
      const title = testTitles[session.testKind];
      const score = `${Math.round((session.score ?? 0) * 100)}%`;
      return {
        id: session.id,
        title: title ? resolveText(title, language).text : session.testKind,
        meta: `${formatShortDate(session.date, language)} · ${score}`,
      };
    });
}
