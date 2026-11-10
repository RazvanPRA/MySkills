import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/** Width of the line-number gutter (fits 3 digits at the code size). */
const GUTTER_WIDTH = 28;

export const createStyles = ({ color, space, radius, touchTarget }: Theme) =>
  StyleSheet.create({
    frame: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.codeSurface,
      overflow: 'hidden',
    },
    content: { padding: space.md },
    // Selectable lines span at least the frame width, so the whole row is the touch target.
    selectableContent: { paddingVertical: space.sm, minWidth: '100%' },
    lines: { flexGrow: 1 },
    line: { flexDirection: 'row', gap: space.md },
    selectableLine: {
      minHeight: touchTarget,
      alignItems: 'center',
      paddingHorizontal: space.md,
      borderWidth: 1,
      borderColor: color.codeSurface,
    },
    selected: { borderColor: color.selectedBorder, backgroundColor: color.selected },
    correct: { borderColor: color.success, backgroundColor: color.successSoft },
    wrong: { borderColor: color.danger, backgroundColor: color.dangerSoft },
    gutter: { minWidth: GUTTER_WIDTH, textAlign: 'right', color: color.muted },
    // Syntax roles: code colors exist only inside CodeBlock (design system §2.2).
    plain: { color: color.codeText },
    keyword: { color: color.syntaxKeyword },
    string: { color: color.syntaxString },
    number: { color: color.syntaxNumber },
    comment: { color: color.syntaxComment },
    function: { color: color.syntaxFunction },
    // A line with a state drops syntax colors: plain bold code text stays ≥ 4.5:1 on every
    // state fill (checked in contrast.test.ts).
    markedText: { color: color.codeText, fontWeight: '600' },
  });

export type CodeBlockStyles = ReturnType<typeof createStyles>;
