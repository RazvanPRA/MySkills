import { memo, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { createStyles } from './CodeBlock.styles';
import type { CodeBlockProps } from './CodeBlock.types';
import { CodeLineRow } from './CodeLineRow';
import { highlightCode } from './highlightCode';

/**
 * Highlighted code (design system §1.7, §7): monospace, never wrapped or shrunk; it scrolls
 * horizontally inside its frame. Highlighting is memoized per code + language.
 */
function CodeBlockBase({ code, language, showLineNumbers = false }: CodeBlockProps) {
  const styles = useThemedStyles(createStyles);
  const lines = useMemo(() => highlightCode(code, language), [code, language]);
  return (
    <View style={styles.frame}>
      <ScrollView horizontal contentContainerStyle={styles.content}>
        <View>
          {lines.map((line, index) => (
            <CodeLineRow
              key={index}
              line={line}
              number={showLineNumbers ? index + 1 : undefined}
              styles={styles}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export const CodeBlock = memo(CodeBlockBase);
