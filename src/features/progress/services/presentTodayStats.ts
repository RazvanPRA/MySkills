import type { ContentCatalog } from '@/features/content';
import { resolveText } from '@/shared/domain';
import type { Language, Strings } from '@/shared/i18n';
import type { Streak } from './computeStreak.service';
import type { TopicSuggestion } from './suggestTopic.service';

export type StatTileModel = { key: string; label: string; value: string; caption?: string };
export type SuggestionModel = { topicId: string; title: string; meta: string };

export type TodayStatsInput = {
  streak: Streak | null;
  week: { accuracy: number | null; count: number } | null;
  suggestion: TopicSuggestion | null;
  mastery: ReadonlyMap<string, number>;
  catalog: ContentCatalog;
  strings: Strings;
  language: Language;
};

function streakTile({ streak, strings }: TodayStatsInput): StatTileModel {
  const { stats } = strings.progress;
  const base = streak?.todayDone ? stats.todayDone : stats.todayPending;
  const caption = streak && streak.frozenDays.length > 0 ? `${base} ${stats.frozen}` : base;
  return {
    key: 'streak',
    label: stats.streak,
    value: strings.counts.days(streak?.days ?? 0),
    caption,
  };
}

function accuracyTile({ week, strings }: TodayStatsInput): StatTileModel {
  const { stats } = strings.progress;
  const accuracy = week?.accuracy ?? null;
  return {
    key: 'accuracy',
    label: stats.accuracy,
    value: accuracy === null ? stats.noValue : stats.percent(accuracy),
    caption: week && week.count > 0 ? strings.counts.answers(week.count) : stats.noAnswers,
  };
}

function suggestionModel(input: TodayStatsInput): SuggestionModel | null {
  const { suggestion, catalog, strings, language, mastery } = input;
  const topic = suggestion ? catalog.topicsById.get(suggestion.topicId) : undefined;
  if (!suggestion || !topic) {
    return null;
  }
  const category = catalog.categoriesById.get(topic.categoryId);
  const reason =
    suggestion.reason === 'weak'
      ? strings.progress.suggestion.weak(mastery.get(topic.id) ?? 0)
      : strings.progress.suggestion.next;
  const parts = [reason, category && resolveText(category.title, language).text];
  return {
    topicId: topic.id,
    title: resolveText(topic.title, language).text,
    meta: [...parts, strings.levels[topic.level]].filter(Boolean).join(' · '),
  };
}

/** Today's streak and accuracy tiles and the suggested topic (design system §6.3). */
export const presentTodayStats = (input: TodayStatsInput) => ({
  tiles: [streakTile(input), accuracyTile(input)],
  suggestion: suggestionModel(input),
});
