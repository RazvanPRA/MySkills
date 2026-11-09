import { StyleSheet } from 'react-native';
import { fontFamily, type Theme } from '@/shared/theme';

/** Width reserved for a list marker ("•", "10."). */
const MARKER_WIDTH = 24;

export const createStyles = ({ color, space }: Theme) =>
  StyleSheet.create({
    blocks: { gap: space.sm },
    item: { flexDirection: 'row', gap: space.xs },
    marker: { minWidth: MARKER_WIDTH },
    itemBody: { flex: 1, gap: space.xs },
    quote: {
      gap: space.sm,
      paddingLeft: space.md,
      borderLeftWidth: 1,
      borderLeftColor: color.border,
    },
    // Inline code keeps the surrounding size; only the font and the code colors change.
    inlineCode: {
      fontFamily: fontFamily.mono,
      color: color.codeText,
      backgroundColor: color.codeSurface,
    },
  });

export type MarkdownStyles = ReturnType<typeof createStyles>;
