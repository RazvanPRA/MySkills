import { AppText } from '../AppText';
import type { MarkdownStyles } from './MarkdownText.styles';
import type { InlineSpan } from './parseMarkdown';

type MarkdownInlineProps = {
  spans: InlineSpan[];
  styles: MarkdownStyles;
  onLinkPress?: (url: string) => void;
};

/** Inline spans, rendered as nested text inside the parent AppText (inherits its variant). */
export function MarkdownInline({ spans, styles, onLinkPress }: MarkdownInlineProps) {
  return (
    <>
      {spans.map((span, index) => {
        switch (span.kind) {
          case 'break':
            return '\n';
          case 'code':
            return (
              <AppText key={index} style={styles.inlineCode}>
                {span.text}
              </AppText>
            );
          case 'link':
            return (
              <AppText
                key={index}
                tone="accent"
                bold
                accessibilityRole={onLinkPress ? 'link' : undefined}
                onPress={onLinkPress ? () => onLinkPress(span.url) : undefined}
              >
                {span.text}
              </AppText>
            );
          default:
            return span.bold ? (
              <AppText key={index} bold>
                {span.text}
              </AppText>
            ) : (
              span.text
            );
        }
      })}
    </>
  );
}
