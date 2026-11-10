import { useCallback, useEffect, useRef } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { resolveText } from '@/shared/domain';
import { useLanguage, useStrings } from '@/shared/i18n';
import { AppText, Button, ScreenContainer } from '@/shared/ui';
import { ExerciseView } from '../components/ExerciseView/ExerciseView';
import { SessionFeedback } from '../components/SessionFeedback/SessionFeedback';
import { SessionHeader } from '../components/SessionHeader/SessionHeader';
import { SessionNavigation } from '../components/SessionNavigation/SessionNavigation';
import { usePlayerActions } from '../hooks/usePlayerActions';
import { usePlayerSession } from '../hooks/usePlayerSession';

export type SessionScreenProps = {
  sessionId: string;
  onFinish: (sessionId: string) => void;
  onLeave: () => void;
  onOpenTopic: (topicId: string) => void;
};

/** The generic player (architecture §7): it composes sections and never knows exercise types. */
export default function SessionScreen({
  sessionId,
  onFinish,
  onLeave,
  onOpenTopic,
}: SessionScreenProps) {
  const strings = useStrings();
  const language = useLanguage();
  const { player, isOpen, exercise, definition, flow, primary, result } =
    usePlayerSession(sessionId);
  const finish = useCallback(() => onFinish(sessionId), [onFinish, sessionId]);
  const { changeAnswer, runPrimary } = usePlayerActions({
    exercise,
    flow,
    action: primary.action,
    onFinish: finish,
  });
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [player.index, player.step]);
  // Everything answered already (e.g. reopened after finishing): go to the results.
  const allAnswered = isOpen && player.exerciseIds.length > 0 && !exercise;
  useEffect(() => {
    if (allAnswered) {
      finish();
    }
  }, [allAnswered, finish]);

  if (player.status === 'missing') {
    return (
      <ScreenContainer>
        <AppText tone="muted">{strings.player.notFound}</AppText>
        <Button label={strings.player.back} variant="secondary" onPress={onLeave} />
      </ScreenContainer>
    );
  }
  if (!exercise || !definition) {
    return (
      <ScreenContainer>
        <AppText tone="muted">{strings.player.loading}</AppText>
      </ScreenContainer>
    );
  }
  const total = player.exerciseIds.length;
  const revealed = player.step === 'revealed';
  return (
    <ScreenContainer ref={scrollRef}>
      <SessionHeader
        testTitle={player.testTitle ? resolveText(player.testTitle, language).text : ''}
        levelLabel={strings.levels[exercise.level]}
        position={strings.player.position(player.index + 1, total)}
        progress={player.attempts.length / total}
        progressLabel={strings.player.progress}
      />
      <ExerciseView
        exercise={exercise}
        definition={definition}
        answer={player.draft}
        onAnswerChange={changeAnswer}
        revealed={revealed}
        result={result}
      />
      {revealed ? (
        <SessionFeedback exercise={exercise} result={result} onOpenTopic={onOpenTopic} />
      ) : null}
      {player.saveFailed ? <AppText tone="danger">{strings.player.saveError}</AppText> : null}
      <SessionNavigation
        action={primary.action}
        enabled={primary.enabled && !player.saving}
        onPrimary={runPrimary}
        onBack={onLeave}
      />
    </ScreenContainer>
  );
}
