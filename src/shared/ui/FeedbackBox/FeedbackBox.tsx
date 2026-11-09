import { memo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText, type TextTone } from '../AppText';
import { createStyles } from './FeedbackBox.styles';
import type { FeedbackBoxProps, FeedbackVerdict } from './FeedbackBox.types';

const titleTone: Record<FeedbackVerdict, TextTone> = {
  correct: 'success',
  wrong: 'danger',
  partial: 'danger',
};

/** Verdict + explanation after an answer. Announced politely when it appears (§9). */
function FeedbackBoxBase({ verdict, title, children }: FeedbackBoxProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.neutral, verdict && styles[verdict]]} accessibilityLiveRegion="polite">
      <AppText bold tone={verdict ? titleTone[verdict] : 'default'}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

export const FeedbackBox = memo(FeedbackBoxBase);
