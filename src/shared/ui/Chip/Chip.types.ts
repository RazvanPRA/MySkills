export type ChipRole = 'checkbox' | 'tab';

export type ChipProps = {
  id: string;
  label: string;
  selected: boolean;
  /** One stable callback for the whole group, receiving the chip id, so `memo` works. */
  onPress: (id: string) => void;
  /** `checkbox` in a multi-select group, `tab` inside a single-select `tablist`. */
  role: ChipRole;
  disabled?: boolean;
};
