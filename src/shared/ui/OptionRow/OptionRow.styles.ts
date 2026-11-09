import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/** Size of the square letter badge (outside the spacing scale, design system §2.7). */
const LETTER_SIZE = 26;

export const createStyles = ({ color, space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    idle: {
      minHeight: touchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      padding: space.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.surface,
    },
    selected: { borderColor: color.selectedBorder, backgroundColor: color.selected },
    correct: { borderColor: color.success, backgroundColor: color.successSoft },
    wrong: { borderColor: color.danger, backgroundColor: color.dangerSoft },
    label: { flex: 1 },
    idleLetter: {
      width: LETTER_SIZE,
      height: LETTER_SIZE,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedLetter: { borderColor: color.selectedBorder },
    correctLetter: { borderColor: color.success, backgroundColor: color.success },
    wrongLetter: { borderColor: color.danger, backgroundColor: color.danger },
    // A filled letter uses the surface color as text (≥ 4.5:1 on success/danger, both schemes;
    // checked in contrast.test.ts).
    filledLetterText: { color: color.surface },
  });
