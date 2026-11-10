import { memo } from 'react';
import { useSettings } from '@/features/settings';
import { useStrings } from '@/shared/i18n';
import { AppText } from '@/shared/ui';
import { formatDuration } from '@/shared/utils/duration';
import { useElapsed } from '../../hooks/useElapsed';

type SessionTimerProps = {
  /** When the current exercise was shown (ISO). */
  shownAt: string | null;
  /** Stops after the answer is checked. */
  running: boolean;
};

/** Optional time on the current exercise (Settings → timer). Renders nothing when off. */
function SessionTimerBase({ shownAt, running }: SessionTimerProps) {
  const { settings } = useSettings();
  const { player } = useStrings();
  const elapsed = useElapsed(shownAt, running && settings.timerEnabled);
  if (!settings.timerEnabled) {
    return null;
  }
  const text = formatDuration(elapsed);
  return (
    <AppText variant="small" tone="muted" accessibilityLabel={player.timer(text)}>
      {text}
    </AppText>
  );
}

export const SessionTimer = memo(SessionTimerBase);
