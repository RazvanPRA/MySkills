import { memo, type ReactNode } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { AppText, ProgressBar, Tag } from '@/shared/ui';
import { createStyles } from './SessionHeader.styles';

type SessionHeaderProps = {
  testTitle: string;
  levelLabel: string;
  /** "3 / 10" */
  position: string;
  /** 0..1 */
  progress: number;
  progressLabel: string;
  /** Optional timer, after the position. */
  timer?: ReactNode;
};

/** Test kind Tag · level Tag · "3 / 10" · thin progress bar (architecture §7). */
function SessionHeaderBase(props: SessionHeaderProps) {
  const { testTitle, levelLabel, position, progress, progressLabel, timer } = props;
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Tag label={testTitle} />
        <Tag label={levelLabel} />
        <AppText variant="small" tone="muted" style={styles.position}>
          {position}
        </AppText>
        {timer}
      </View>
      <ProgressBar progress={progress} accessibilityLabel={progressLabel} />
    </View>
  );
}

export const SessionHeader = memo(SessionHeaderBase);
