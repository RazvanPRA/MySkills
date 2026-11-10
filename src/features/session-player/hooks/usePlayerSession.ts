import { useEffect } from 'react';
import { useContentCatalog, useExerciseType } from '@/features/content';
import { nextPrimaryAction } from '../services/nextPrimaryAction.service';
import { selectPlayer, useSessionPlayerDispatch, useSessionPlayerSelector } from '../state/hooks';
import { openSession } from '../state/thunks';

/** Opens a session and derives the current exercise, its type and the primary action. */
export function usePlayerSession(sessionId: string) {
  const catalog = useContentCatalog();
  const dispatch = useSessionPlayerDispatch();
  const player = useSessionPlayerSelector(selectPlayer);

  useEffect(() => {
    dispatch(openSession({ sessionId, catalog }));
  }, [dispatch, sessionId, catalog]);

  const isOpen = player.status === 'ready' && player.session?.id === sessionId;
  const exerciseId = isOpen ? player.exerciseIds[player.index] : undefined;
  const exercise = exerciseId ? catalog.exercisesById.get(exerciseId) : undefined;
  const definition = useExerciseType(exercise?.type ?? '');
  const flow = definition?.flow ?? 'check';
  const answerValid = definition?.answerSchema.safeParse(player.draft).success ?? false;
  const primary = nextPrimaryAction({
    flow,
    step: player.step,
    isLast: player.index === player.exerciseIds.length - 1,
    answerValid,
  });
  // In the check flow the result shown after reveal is the attempt just stored.
  const lastAttempt = player.attempts[player.attempts.length - 1];
  const result =
    player.step === 'revealed' && lastAttempt && lastAttempt.exerciseId === exerciseId
      ? lastAttempt.result
      : null;

  return { player, isOpen, exercise, definition, flow, primary, result };
}
