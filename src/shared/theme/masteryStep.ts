export type MasteryStep = 0 | 1 | 2 | 3 | 4;

/**
 * Maps a mastery percentage to a step of the mastery scale (design system §2.3).
 * `null` means "not started" (step 0). Any started topic is at least step 1, even at 0%.
 * The value is rounded, then clamped to 0..100. NaN is treated as "not started".
 */
export function masteryStep(percent: number | null): MasteryStep {
  if (percent === null || Number.isNaN(percent)) {
    return 0;
  }
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  if (value >= 90) {
    return 4;
  }
  if (value >= 70) {
    return 3;
  }
  if (value >= 40) {
    return 2;
  }
  return 1;
}
