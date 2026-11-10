import { useEffect, useState } from 'react';

const TICK_MS = 1000;

/**
 * Milliseconds since `since` (ISO), refreshed every second while `running`. When stopped it
 * keeps the last value, so the time spent stays visible after "Verifică".
 */
export function useElapsed(since: string | null, running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) {
      return undefined;
    }
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [running, since]);
  return since === null ? 0 : Math.max(0, now - Date.parse(since));
}
