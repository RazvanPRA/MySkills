import { AppText } from '../AppText';
import type { MarkdownStyles } from './MarkdownText.styles';
import type { MarkdownVariant } from './MarkdownText.types';
import type { InlineSpan } from './parseMarkdown';

type MarkdownInlineProps = {
  spans: InlineSpan[];
  styles: MarkdownStyles;
  /** The parent's variant: a nested AppText would otherwise reset to `body`. */
  variant: MarkdownVariant;
  onLinkPress?: (url: string) => void;
};

/** Inline spans, rendered as nested text inside the parent AppText, at the parent's size. */
export function MarkdownInline({ spans, styles, variant, onLinkPress }: MarkdownInlineProps) {
  return (
    <>
      {spans.map((span, index) => {
        switch (span.kind) {
          case 'break':
            return '\n';
          case 'code':
            return (
              <AppText key={index} variant={variant} style={styles.inlineCode}>
                {span.text}
              </AppText>
            );
          case 'link':
            return (
              <AppText
                key={index}
                variant={variant}
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
              <AppText key={index} variant={variant} bold>
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
