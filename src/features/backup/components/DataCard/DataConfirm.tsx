import { useStrings } from '@/shared/i18n';
import { ActionRow, AppText, Button } from '@/shared/ui';

type DataConfirmProps = {
  question: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Inline confirmation: Cancel (secondary, left) · the action (primary, right). */
export function DataConfirm({ question, confirmLabel, onConfirm, onCancel }: DataConfirmProps) {
  const { backup: strings } = useStrings();
  return (
    <>
      <AppText accessibilityLiveRegion="polite">{question}</AppText>
      <ActionRow>
        <Button label={strings.cancel} variant="secondary" onPress={onCancel} />
        <Button label={confirmLabel} onPress={onConfirm} />
      </ActionRow>
    </>
  );
}
