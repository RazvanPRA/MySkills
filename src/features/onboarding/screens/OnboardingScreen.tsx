import { useStrings } from '@/shared/i18n';
import { ActionRow, Button, ProgressBar, ScreenContainer, ScreenHeader } from '@/shared/ui';
import { AssessStep } from '../components/AssessStep/AssessStep';
import { ReminderStep, ReviewStep, WelcomeStep } from '../components/IntroSteps';
import { useOnboarding } from '../hooks/useOnboarding';

/** First run (brief §9.1): track → self-assessment → marked topics → reminder. */
export default function OnboardingScreen() {
  const { onboarding: strings, bootstrap } = useStrings();
  const flow = useOnboarding();
  const position = strings.step(flow.index + 1, flow.total);
  const last = flow.step === 'reminder';
  const primaryLabel = flow.index === 0 ? strings.start : last ? strings.finish : strings.next;
  return (
    <ScreenContainer bottomInset>
      <ScreenHeader title={bootstrap.loadingTitle} subtitle={position} />
      <ProgressBar progress={(flow.index + 1) / flow.total} accessibilityLabel={position} />
      {flow.step === 'welcome' ? <WelcomeStep /> : null}
      {flow.step === 'assess' ? (
        <AssessStep
          categories={flow.categories}
          assessment={flow.assessment}
          onAssess={flow.assess}
        />
      ) : null}
      {flow.step === 'review' ? <ReviewStep markCount={flow.markCount} /> : null}
      {last ? <ReminderStep /> : null}
      <ActionRow>
        {flow.index > 0 ? (
          <Button label={strings.back} variant="secondary" onPress={flow.back} />
        ) : null}
        <Button
          label={primaryLabel}
          onPress={last ? flow.finish : flow.next}
          disabled={flow.busy}
        />
      </ActionRow>
    </ScreenContainer>
  );
}
