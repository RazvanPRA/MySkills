export type SegmentOption<T extends string> = { id: T; label: string };

export type SegmentedControlProps<T extends string> = {
  /** 2–4 short, already translated options. */
  options: readonly SegmentOption<T>[];
  value: T | null;
  onChange: (id: T) => void;
  /** Names the group for screen readers ("Limbă", "Cât de bine ai știut?"). */
  accessibilityLabel: string;
  disabled?: boolean;
};
