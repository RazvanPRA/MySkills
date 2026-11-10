export type TextFieldProps = {
  /** Visible label, also used as the input's accessible name. */
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Muted help text under the input, read as the accessibility hint. */
  help?: string;
  /** Monospace font, for code output answers. */
  monospace?: boolean;
  /** Notes and longer answers. */
  multiline?: boolean;
  /**
   * `readOnly`: not editable, full contrast (an answer shown after reveal).
   * `disabled`: not editable and dimmed (design system §5).
   */
  mode?: TextFieldMode;
};

export type TextFieldMode = 'editable' | 'readOnly' | 'disabled';
