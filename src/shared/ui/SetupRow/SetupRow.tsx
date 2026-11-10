import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { createStyles } from './SetupRow.styles';
import type { SetupRowProps } from './SetupRow.types';

/** One setting or onboarding choice: label → control → help (design system §6.3). */
function SetupRowBase({ label, children, help }: SetupRowProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      {children}
      {help ? (
        <AppText variant="caption" tone="muted">
          {help}
        </AppText>
      ) : null}
    </View>
  );
}

export const SetupRow = memo(SetupRowBase);
