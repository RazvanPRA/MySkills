import type { EvaluationResult } from '@/shared/domain';
import type { Strings } from '@/shared/i18n';
import type { FeedbackVerdict } from '@/shared/ui';

/** Pure: a result → the FeedbackBox verdict and its text ("Corect", "Parțial corect (2/3)"). */
export function verdictOf(
  result: EvaluationResult,
  strings: Strings['player'],
): { verdict: FeedbackVerdict; title: string } {
  if (result.correct) {
    return { verdict: 'correct', title: strings.correct };
  }
  if (result.score > 0 && result.credit) {
    return {
      verdict: 'partial',
      title: strings.partial(result.credit.earned, result.credit.total),
    };
  }
  return { verdict: 'wrong', title: strings.wrong };
}
