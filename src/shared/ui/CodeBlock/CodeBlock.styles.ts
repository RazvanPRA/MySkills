import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/** Width of the line-number gutter (fits 3 digits at the code size). */
const GUTTER_WIDTH = 28;

export const createStyles = ({ color, space, radius }: Theme) =>
  StyleSheet.create({
    frame: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: color.border,
      backgroundColor: color.codeSurface,
      overflow: 'hidden',
    },
    content: { padding: space.md },
    line: { flexDirection: 'row', gap: space.md },
    gutter: { minWidth: GUTTER_WIDTH, textAlign: 'right', color: color.muted },
    // Syntax roles: code colors exist only inside CodeBlock (design system §2.2).
    plain: { color: color.codeText },
    keyword: { color: color.syntaxKeyword },
    string: { color: color.syntaxString },
    number: { color: color.syntaxNumber },
    comment: { color: color.syntaxComment },
    function: { color: color.syntaxFunction },
  });

export type CodeBlockStyles = ReturnType<typeof createStyles>;
