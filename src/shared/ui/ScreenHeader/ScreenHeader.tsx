import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText } from '../AppText';
import { createStyles } from './ScreenHeader.styles';
import type { ScreenHeaderProps } from './ScreenHeader.types';

function ScreenHeaderBase({ title, subtitle, accessory }: ScreenHeaderProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.header}>
      <View style={styles.texts}>
        {/* The screen title is the only text allowed to shrink to fit one line. */}
        <AppText
          variant="display"
          accessibilityRole="header"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {title}
        </AppText>
        {subtitle ? <AppText tone="muted">{subtitle}</AppText> : null}
      </View>
      {accessory}
    </View>
  );
}

export const ScreenHeader = memo(ScreenHeaderBase);
