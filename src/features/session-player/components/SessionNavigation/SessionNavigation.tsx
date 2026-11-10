import { memo } from 'react';
import { useStrings } from '@/shared/i18n';
import { ActionRow, Button } from '@/shared/ui';
import type { PrimaryAction } from '../../services/nextPrimaryAction.service';

type SessionNavigationProps = {
  action: PrimaryAction;
  enabled: boolean;
  onPrimary: () => void;
  onBack: () => void;
};

/** Back (secondary, left) · primary (right): Verifică → Următoarea → Termină (§6.1). */
function SessionNavigationBase({ action, enabled, onPrimary, onBack }: SessionNavigationProps) {
  const { player } = useStrings();
  const labels: Record<PrimaryAction, string> = {
    check: player.check,
    show_answer: player.showAnswer,
    next: player.next,
    finish: player.finish,
  };
  return (
    <ActionRow>
      <Button label={player.back} variant="secondary" onPress={onBack} />
      <Button label={labels[action]} onPress={onPrimary} disabled={!enabled} />
    </ActionRow>
  );
}

export const SessionNavigation = memo(SessionNavigationBase);
