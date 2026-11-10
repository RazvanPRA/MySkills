import type { OptionState } from '../OptionRow';

/** A code line's visual state: same meaning as an answer option (design system §5). */
export type CodeLineState = OptionState;

/** Makes every line a pressable `button` (find_bug: "tap the buggy line"). */
export type CodeLineSelection = {
  /** State per line, index = line number - 1; missing lines are `idle`. */
  states: readonly CodeLineState[];
  /** Receives the 1-based line number. */
  onSelectLine: (lineNumber: number) => void;
  /** Accessible name of a line, e.g. (4, "return a + b;") → "Linia 4: return a + b;". */
  lineLabel: (lineNumber: number, text: string) => string;
  /** After reveal the lines are read-only. */
  disabled?: boolean;
};

export type CodeBlockProps = {
  code: string;
  /** Fence language ("ts", "java", "sql"…). Unknown or missing → plain text. */
  language?: string;
  showLineNumbers?: boolean;
  /** When present, every line is selectable and numbered. */
  selection?: CodeLineSelection;
};
