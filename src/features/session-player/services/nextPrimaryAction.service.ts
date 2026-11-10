import type { ExerciseFlow } from '@/features/content';

export type PlayerStep = 'answering' | 'revealed';
export type PrimaryAction = 'check' | 'show_answer' | 'next' | 'finish';

type ActionInput = {
  flow: ExerciseFlow;
  step: PlayerStep;
  isLast: boolean;
  /** The draft passes the exercise type's answerSchema (for flashcards: a rating was chosen). */
  answerValid: boolean;
};

/**
 * Pure (design system §6.1, §6.2): the label of the primary button follows the step,
 * Verifică → Următoarea → Termină; flashcards start with "Arată răspunsul" and need a
 * rating before moving on. An unavailable action is disabled, never hidden.
 */
export function nextPrimaryAction({ flow, step, isLast, answerValid }: ActionInput) {
  const advance: PrimaryAction = isLast ? 'finish' : 'next';
  if (flow === 'self_graded') {
    return step === 'answering'
      ? { action: 'show_answer' as const, enabled: true }
      : { action: advance, enabled: answerValid };
  }
  return step === 'answering'
    ? { action: 'check' as const, enabled: answerValid }
    : { action: advance, enabled: true };
}
