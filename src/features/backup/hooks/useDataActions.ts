import { useCallback, useState } from 'react';
import { useLanguage, useStrings } from '@/shared/i18n';
import type { Backup } from '../model/backup';
import { describeBackup } from '../services/describeBackup';
import { useBackupDispatch } from '../state/hooks';
import { exportData, pickBackup, resetData, restoreBackup } from '../state/thunks';

export type DataStep =
  | { kind: 'idle'; message: string | null }
  | { kind: 'busy' }
  | { kind: 'confirmImport'; backup: Backup; question: string }
  | { kind: 'confirmReset' };

const idle = (message: string | null = null): DataStep => ({ kind: 'idle', message });

/**
 * Export, import and reset as a small state machine: nothing is replaced or deleted before
 * an explicit confirmation. `onDataReplaced` reloads the app afterwards.
 */
export function useDataActions(onDataReplaced: () => void) {
  const dispatch = useBackupDispatch();
  const strings = useStrings();
  const language = useLanguage();
  const [step, setStep] = useState<DataStep>(idle());
  const text = strings.backup;

  const exportAll = useCallback(async () => {
    setStep({ kind: 'busy' });
    const result = await dispatch(exportData());
    const saved = exportData.fulfilled.match(result) && result.payload === 'saved';
    const failed = exportData.rejected.match(result);
    setStep(idle(saved ? text.exported : failed ? text.exportFailed : null));
  }, [dispatch, text]);

  const importFile = useCallback(async () => {
    setStep({ kind: 'busy' });
    const picked = await dispatch(pickBackup())
      .unwrap()
      .catch(() => null);
    if (picked?.status === 'ready') {
      const question = describeBackup(picked.backup, strings, language);
      setStep({ kind: 'confirmImport', backup: picked.backup, question });
    } else {
      setStep(idle(picked?.status === 'invalid' ? text.problems[picked.problem] : null));
    }
  }, [dispatch, strings, language, text]);

  const confirm = useCallback(async () => {
    const current = step;
    setStep({ kind: 'busy' });
    try {
      if (current.kind === 'confirmImport') {
        await dispatch(restoreBackup(current.backup)).unwrap();
      } else {
        await dispatch(resetData()).unwrap();
      }
      onDataReplaced();
    } catch {
      setStep(idle(current.kind === 'confirmImport' ? text.importFailed : text.resetFailed));
    }
  }, [dispatch, step, onDataReplaced, text]);

  const askReset = useCallback(() => setStep({ kind: 'confirmReset' }), []);
  const cancel = useCallback(() => setStep(idle()), []);
  return { step, exportAll, importFile, askReset, confirm, cancel };
}
