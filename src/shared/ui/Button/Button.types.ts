export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = {
  /** Already translated: a verb or a short noun action ("Verifică", "Începe"). */
  label: string;
  onPress: () => void;
  /** Exactly one `primary` per action row, placed last (right). */
  variant?: ButtonVariant;
  /** Disable, never hide, an unavailable action so the layout does not jump. */
  disabled?: boolean;
  accessibilityHint?: string;
};
