import { useCallback } from 'react';
import type { Exercise, ExerciseFlow } from '@/features/content';
import type { PrimaryAction } from '../services/nextPrimaryAction.service';
import { useSessionPlayerDispatch } from '../state/hooks';
import { answerShown, draftChanged } from '../state/slice';
import { goToNext, submitAnswer } from '../state/thunks';

type ActionContext = {
  exercise: Exercise | undefined;
  flow: ExerciseFlow;
  action: PrimaryAction;
  onFinish: () => void;
};

/**
 * Runs the primary action. In the check flow the answer is stored on "Verifică"; a
 * self-graded answer (the rating) is stored when the user moves on.
 */
export function usePlayerActions({ exercise, flow, action, onFinish }: ActionContext) {
  const dispatch = useSessionPlayerDispatch();

  const changeAnswer = useCallback((answer: unknown) => dispatch(draftChanged(answer)), [dispatch]);

  const runPrimary = useCallback(async () => {
    if (!exercise) {
      return;
    }
    if (action === 'show_answer') {
      dispatch(answerShown());
      return;
    }
    const needsSubmit = action === 'check' || flow === 'self_graded';
    if (needsSubmit) {
      const submitted = await dispatch(submitAnswer({ exercise }));
      if (submitAnswer.rejected.match(submitted) || action === 'check') {
        return;
      }
    }
    if (action === 'finish') {
      onFinish();
    } else {
      await dispatch(goToNext());
    }
  }, [dispatch, exercise, flow, action, onFinish]);

  return { changeAnswer, runPrimary };
}
