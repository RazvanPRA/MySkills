import type { ContentCatalog } from '@/features/content';
import type { Attempt } from '../model/attempt';
import { sessionScore } from './progressSession.service';

export type ReviewTopic = { topicId: string; mistakes: number };
export type ResultVerdict = 'strong' | 'fair' | 'weak';

export type SessionSummary = {
  correct: number;
  total: number;
  /** 0..100, rounded. */
  percent: number;
  verdict: ResultVerdict;
  /** Topics with mistakes, most mistakes first (brief §7.3: "topics to re-read"). */
  toReview: ReviewTopic[];
};

const STRONG = 80;
const FAIR = 50;

const verdictFor = (percent: number): ResultVerdict =>
  percent >= STRONG ? 'strong' : percent >= FAIR ? 'fair' : 'weak';

function topicsToReview(attempts: readonly Attempt[], catalog: ContentCatalog): ReviewTopic[] {
  const mistakes = new Map<string, number>();
  for (const attempt of attempts.filter(item => !item.result.correct)) {
    const topicId = catalog.exercisesById.get(attempt.exerciseId)?.topicId;
    if (topicId) {
      mistakes.set(topicId, (mistakes.get(topicId) ?? 0) + 1);
    }
  }
  return [...mistakes]
    .map(([topicId, count]) => ({ topicId, mistakes: count }))
    .sort((a, b) => b.mistakes - a.mistakes || a.topicId.localeCompare(b.topicId));
}

/** Pure: the results screen's numbers, from a session's attempts. */
export function summarizeSession(
  exerciseIds: readonly string[],
  attempts: readonly Attempt[],
  catalog: ContentCatalog,
): SessionSummary {
  const inSession = attempts.filter(attempt => exerciseIds.includes(attempt.exerciseId));
  const percent = Math.round(sessionScore(exerciseIds, inSession) * 100);
  return {
    correct: inSession.filter(attempt => attempt.result.correct).length,
    total: exerciseIds.length,
    percent,
    verdict: verdictFor(percent),
    toReview: topicsToReview(inSession, catalog),
  };
}
