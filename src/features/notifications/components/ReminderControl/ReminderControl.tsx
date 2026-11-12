import { View } from 'react-native';
import { useStrings } from '@/shared/i18n';
import { useThemedStyles } from '@/shared/theme';
import { AppText, Button, SegmentedControl, SetupRow } from '@/shared/ui';
import { useReminder } from '../../hooks/useReminder';
import { createStyles } from './ReminderControl.styles';

/** Daily reminder on/off and its time (Settings and onboarding). */
export default function ReminderControl() {
  const styles = useThemedStyles(createStyles);
  const { notifications: strings } = useStrings();
  const reminder = useReminder();
  const options = [
    { id: 'off', label: strings.off },
    { id: 'on', label: strings.on },
  ];
  return (
    <View style={styles.group}>
      <SetupRow label={strings.title} help={strings.help}>
        <SegmentedControl
          options={options}
          value={reminder.enabled ? 'on' : 'off'}
          onChange={reminder.toggle}
          accessibilityLabel={strings.title}
        />
      </SetupRow>
      {reminder.enabled ? (
        <SetupRow label={strings.time}>
          <View style={styles.stepper}>
            <Button
              label={strings.stepEarlier}
              variant="secondary"
              onPress={reminder.earlier}
              accessibilityHint={strings.earlier}
            />
            <AppText variant="title" accessibilityLabel={strings.timeLabel(reminder.time)}>
              {reminder.time}
            </AppText>
            <Button
              label={strings.stepLater}
              variant="secondary"
              onPress={reminder.later}
              accessibilityHint={strings.later}
            />
          </View>
        </SetupRow>
      ) : null}
      {reminder.denied ? (
        <>
          <AppText variant="small" accessibilityLiveRegion="polite">
            {strings.denied}
          </AppText>
          <Button
            label={strings.openSettings}
            variant="secondary"
            onPress={reminder.openSettings}
          />
        </>
      ) : null}
    </View>
  );
}
