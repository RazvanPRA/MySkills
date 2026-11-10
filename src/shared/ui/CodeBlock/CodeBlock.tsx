import { memo, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { createStyles } from './CodeBlock.styles';
import type { CodeBlockProps } from './CodeBlock.types';
import { CodeLineRow, SelectableCodeLine } from './CodeLineRow';
import { highlightCode } from './highlightCode';

/**
 * Highlighted code (design system §1.7, §7): monospace, never wrapped or shrunk; it scrolls
 * horizontally inside its frame. Highlighting is memoized per code + language. With
 * `selection`, every line is a numbered, full-width button (find_bug).
 */
function CodeBlockBase({ code, language, showLineNumbers = false, selection }: CodeBlockProps) {
  const styles = useThemedStyles(createStyles);
  const lines = useMemo(() => highlightCode(code, language), [code, language]);
  return (
    <View style={styles.frame}>
      <ScrollView
        horizontal
        contentContainerStyle={selection ? styles.selectableContent : styles.content}
      >
        <View style={styles.lines}>
          {lines.map((line, index) =>
            selection ? (
              <SelectableCodeLine
                key={index}
                line={line}
                number={index + 1}
                selection={selection}
                styles={styles}
              />
            ) : (
              <CodeLineRow
                key={index}
                line={line}
                number={showLineNumbers ? index + 1 : undefined}
                styles={styles}
              />
            ),
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export const CodeBlock = memo(CodeBlockBase);
