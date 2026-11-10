import { useStrings } from '@/shared/i18n';
import { AppText, Card, SegmentedControl, SetupRow } from '@/shared/ui';
import { usePreferences } from '../../hooks/usePreferences';

/** Language, test lengths and the optional timer; every change is saved at once. */
export function PreferencesCard() {
  const { settings: strings } = useStrings();
  const { options, values, handlers } = usePreferences();
  return (
    <Card>
      <AppText variant="label" tone="muted" accessibilityRole="header">
        {strings.preferences}
      </AppText>
      <SetupRow label={strings.language} help={strings.languageHelp}>
        <SegmentedControl
          options={options.language}
          value={values.language}
          onChange={handlers.language}
          accessibilityLabel={strings.language}
        />
      </SetupRow>
      <SetupRow label={strings.knowledgeLength} help={strings.lengthHelp}>
        <SegmentedControl
          options={options.knowledge}
          value={values.knowledge}
          onChange={handlers.knowledge}
          accessibilityLabel={strings.knowledgeLength}
        />
      </SetupRow>
      <SetupRow label={strings.logicLength}>
        <SegmentedControl
          options={options.logic}
          value={values.logic}
          onChange={handlers.logic}
          accessibilityLabel={strings.logicLength}
        />
      </SetupRow>
      <SetupRow label={strings.timer} help={strings.timerHelp}>
        <SegmentedControl
          options={options.timer}
          value={values.timer}
          onChange={handlers.timer}
          accessibilityLabel={strings.timer}
        />
      </SetupRow>
    </Card>
  );
}
