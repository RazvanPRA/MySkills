/** After reveal: `correct` = in its place, `wrong` = not (design system §6.2, ordering). */
export type ReorderItemState = 'idle' | 'correct' | 'wrong';

export type ReorderDirection = 'up' | 'down';

export type ReorderListItem = {
  id: string;
  /** Markdown (inline code is common in steps and log lines). */
  text: string;
  state?: ReorderItemState;
  /** Text under the item, e.g. "Poziția corectă: 3" after reveal. */
  caption?: string;
};

/** Translated labels; primitives never import i18n. */
export type ReorderListLabels = {
  /** Visible text of the buttons, e.g. "Sus" / "Jos". */
  up: string;
  down: string;
  /** Accessible names, e.g. text → "Mută în sus: <text>". */
  moveUp: (text: string) => string;
  moveDown: (text: string) => string;
};

export type ReorderListProps = {
  /** In the current order; the position number is shown before each item. */
  items: readonly ReorderListItem[];
  /** One stable callback for the whole list. */
  onMove: (id: string, direction: ReorderDirection) => void;
  labels: ReorderListLabels;
  /** After reveal the order is read-only. */
  disabled?: boolean;
  /** Accessible name of the list (e.g. the instruction "Ordonează pașii"). */
  accessibilityLabel?: string;
};
