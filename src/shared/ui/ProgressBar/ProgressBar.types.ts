export type ProgressTone = 'accent' | 'success' | 'danger';

export type ProgressBarProps = {
  /** 0..1; values outside the range are clamped. */
  progress: number;
  tone?: ProgressTone;
  /** 8 pt instead of 4 pt. */
  thick?: boolean;
  /** What is progressing ("Progres test", "Întrebarea 3 din 10"). */
  accessibilityLabel?: string;
};
