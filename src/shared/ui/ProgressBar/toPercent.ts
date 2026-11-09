/** Converts a 0..1 progress value to a whole percentage, clamped to 0..100 (NaN → 0). */
export function toPercent(progress: number): number {
  if (Number.isNaN(progress)) {
    return 0;
  }
  return Math.round(Math.min(1, Math.max(0, progress)) * 100);
}
