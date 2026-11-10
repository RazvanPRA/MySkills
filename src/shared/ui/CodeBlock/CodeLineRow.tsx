import { memo } from 'react';
import { View } from 'react-native';
import { AppText } from '../AppText';
import type { CodeBlockStyles } from './CodeBlock.styles';
import type { CodeLine } from './highlightCode';

type CodeLineRowProps = {
  line: CodeLine;
  /** 1-based; omitted when line numbers are hidden. */
  number?: number;
  styles: CodeBlockStyles;
};

/** One line of code: optional gutter + colored spans. Never wraps (the block scrolls). */
function CodeLineRowBase({ line, number, styles }: CodeLineRowProps) {
  return (
    <View style={styles.line}>
      {number === undefined ? null : (
        <AppText variant="code" style={styles.gutter} importantForAccessibility="no">
          {number}
        </AppText>
      )}
      <AppText variant="code" style={styles.plain}>
        {line.map((span, index) => (
          <AppText key={index} variant="code" style={styles[span.role]}>
            {span.text}
          </AppText>
        ))}
      </AppText>
    </View>
  );
}

export const CodeLineRow = memo(CodeLineRowBase);
