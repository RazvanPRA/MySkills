import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '@/shared/theme';
import { MarkdownBlockView } from './MarkdownBlockView';
import { createStyles } from './MarkdownText.styles';
import type { MarkdownTextProps } from './MarkdownText.types';
import { parseMarkdown } from './parseMarkdown';

/**
 * Explanations, questions and topic summaries (design system §4.2): headings, paragraphs and
 * lists map to AppText variants, fenced code to CodeBlock, inline code to the code font.
 */
function MarkdownTextBase({
  content,
  variant = 'body',
  bold = false,
  onLinkPress,
}: MarkdownTextProps) {
  const styles = useThemedStyles(createStyles);
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  const context = useMemo(
    () => ({ styles, variant, bold, onLinkPress }),
    [styles, variant, bold, onLinkPress],
  );
  return (
    <View style={styles.blocks}>
      {blocks.map((block, index) => (
        <MarkdownBlockView key={index} block={block} context={context} />
      ))}
    </View>
  );
}

export const MarkdownText = memo(MarkdownTextBase);
