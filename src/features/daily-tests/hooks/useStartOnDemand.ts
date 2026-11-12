import { useCallback, useState } from 'react';
import { useContentCatalog } from '@/features/content';
import type { TestScope } from '../model/dailySession';
import { startOnDemandSession } from '../state/onDemandThunks';
import { useDailyTestsDispatch } from '../state/hooks';

/**
 * Starts (or resumes) an on-demand session and hands its id to `onStarted`, e.g. to open the
 * player. `failed` is set when the session could not be created.
 */
export function useStartOnDemand(testKind: string, onStarted: (sessionId: string) => void) {
  const catalog = useContentCatalog();
  const dispatch = useDailyTestsDispatch();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const start = useCallback(
    async (scope: TestScope) => {
      setBusy(true);
      setFailed(false);
      try {
        const sessionId = await dispatch(
          startOnDemandSession({ catalog, testKind, scope }),
        ).unwrap();
        if (sessionId) {
          onStarted(sessionId);
        } else {
          setFailed(true);
        }
      } catch {
        setFailed(true);
      } finally {
        setBusy(false);
      }
    },
    [catalog, dispatch, testKind, onStarted],
  );
  return { start, busy, failed };
}
