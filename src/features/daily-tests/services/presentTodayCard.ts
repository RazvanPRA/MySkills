import type { ContentCatalog } from '@/features/content';
import { resolveText } from '@/shared/domain';
import type { Language, Strings } from '@/shared/i18n';
import type { DailySession } from '../model/dailySession';
import type { TodayCardState } from '../state/slice';
import { availableExerciseIds, estimatedMinutes } from './sessionHelpers';

/** Everything one Today card shows (design system §6.3), already translated. */
export type TodayCardModel = {
  kind: string;
  title: string;
  /** "10 întrebări · ~12 minute"; null when there is nothing to test. */
  meta: string | null;
  statusLabel: string;
  /** "Începe" / "Continuă" with the session to open; null when done or empty. */
  primary: { label: string; sessionId: string } | null;
  /** Replaces the button once the test is done. */
  scoreText: string | null;
  /** Why the test is empty or short (design system §6.3 empty states). */
  notice: string | null;
  showMarkTopics: boolean;
};

type PresentInput = {
  card: TodayCardState;
  catalog: ContentCatalog;
  strings: Strings;
  language: Language;
};

type CardFacts = {
  card: TodayCardState;
  session: DailySession;
  total: number;
  today: Strings['today'];
};
type StatusPart = Pick<
  TodayCardModel,
  'statusLabel' | 'primary' | 'scoreText' | 'notice' | 'showMarkTopics'
>;

const completed = ({ session, today }: CardFacts): StatusPart => ({
  statusLabel: today.status.completed,
  primary: null,
  scoreText: today.score(Math.round((session.score ?? 0) * 100)),
  notice: null,
  showMarkTopics: false,
});

const inProgress = ({ card, session, total, today }: CardFacts): StatusPart => ({
  statusLabel: today.status.inProgress(card.answered, total),
  primary: { label: today.continue, sessionId: session.id },
  scoreText: null,
  notice: null,
  showMarkTopics: false,
});

const marksTopics = (card: TodayCardState) => card.shortfall?.remedy === 'mark_topics';

function pending({ card, session, today }: CardFacts): StatusPart {
  const { shortfall } = card;
  const shortfallText = marksTopics(card) ? today.shortfall : today.shortfallContent;
  return {
    statusLabel: today.status.pending,
    primary: { label: today.start, sessionId: session.id },
    scoreText: null,
    notice: shortfall ? shortfallText(shortfall.available, shortfall.target) : null,
    showMarkTopics: marksTopics(card),
  };
}

const BY_STATUS = { pending, in_progress: inProgress, completed };

/** Pure: a Today card's state → what it displays. */
export function presentTodayCard({
  card,
  catalog,
  strings,
  language,
}: PresentInput): TodayCardModel {
  const { today, counts } = strings;
  const base = { kind: card.kind, title: resolveText(card.title, language).text };
  const ids = card.session ? availableExerciseIds(card.session, catalog) : [];
  if (!card.session || ids.length === 0) {
    const empty = { meta: null, statusLabel: today.status.pending, primary: null, scoreText: null };
    const showMarkTopics = marksTopics(card);
    const notice = showMarkTopics ? today.empty : today.emptyContent;
    return { ...base, ...empty, notice, showMarkTopics };
  }
  const minutes = today.approxMinutes(counts.minutes(estimatedMinutes(ids, catalog)));
  const count = card.itemKind === 'problem' ? counts.problems : counts.questions;
  const meta = `${count(ids.length)} · ${minutes}`;
  const facts: CardFacts = { card, session: card.session, total: ids.length, today };
  return { ...base, meta, ...BY_STATUS[card.session.status](facts) };
}
