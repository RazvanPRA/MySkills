import { useStrings } from '@/shared/i18n';
import { ActionRow, AppText, Button, Card } from '@/shared/ui';
import { useDataActions } from '../../hooks/useDataActions';
import { DataConfirm } from './DataConfirm';

export type DataCardProps = {
  /** Called after an import or reset replaced the data, to reload the app. */
  onDataReplaced: () => void;
};

/** Settings → "Datele tale": export, import, delete (brief §9.8). */
export default function DataCard({ onDataReplaced }: DataCardProps) {
  const { backup: strings } = useStrings();
  const { step, exportAll, importFile, askReset, confirm, cancel } = useDataActions(onDataReplaced);
  const busy = step.kind === 'busy';
  return (
    <Card>
      <AppText variant="label" tone="muted" accessibilityRole="header">
        {strings.title}
      </AppText>
      <AppText variant="small" tone="muted">
        {strings.help}
      </AppText>
      {step.kind === 'confirmImport' || step.kind === 'confirmReset' ? (
        <DataConfirm
          question={step.kind === 'confirmImport' ? step.question : strings.resetConfirm}
          confirmLabel={step.kind === 'confirmImport' ? strings.replace : strings.deleteAll}
          onConfirm={confirm}
          onCancel={cancel}
        />
      ) : (
        <>
          {step.kind === 'idle' && step.message ? (
            <AppText variant="small" accessibilityLiveRegion="polite">
              {step.message}
            </AppText>
          ) : null}
          <ActionRow>
            <Button label={strings.reset} variant="secondary" onPress={askReset} disabled={busy} />
            <Button
              label={strings.import}
              variant="secondary"
              onPress={importFile}
              disabled={busy}
            />
            <Button label={strings.export} onPress={exportAll} disabled={busy} />
          </ActionRow>
        </>
      )}
    </Card>
  );
}
