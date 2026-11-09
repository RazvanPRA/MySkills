import { View } from 'react-native';
import { AppText } from '../AppText';
import { CodeBlock } from '../CodeBlock';
import { MarkdownInline } from './MarkdownInline';
import type { MarkdownStyles } from './MarkdownText.styles';
import type { MarkdownVariant } from './MarkdownText.types';
import type { MarkdownBlock } from './parseMarkdown';

type BlockContext = {
  styles: MarkdownStyles;
  variant: MarkdownVariant;
  onLinkPress?: (url: string) => void;
};

type MarkdownBlockViewProps = { block: MarkdownBlock; context: BlockContext };

/** Headings up to level 2 use the title size; deeper headings are bold paragraphs. */
const headingVariant = (level: number, variant: MarkdownVariant) =>
  level <= 2 ? 'title' : variant;

function ListBlock({
  block,
  context,
}: {
  block: Extract<MarkdownBlock, { kind: 'list' }>;
  context: BlockContext;
}) {
  return (
    <View style={context.styles.blocks}>
      {block.items.map((item, index) => (
        <View key={index} style={context.styles.item}>
          <AppText
            variant={context.variant}
            style={context.styles.marker}
            importantForAccessibility="no"
          >
            {block.ordered ? `${block.start + index}.` : '•'}
          </AppText>
          <View style={context.styles.itemBody}>
            {item.map((child, childIndex) => (
              <MarkdownBlockView key={childIndex} block={child} context={context} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** One Markdown block mapped to the design system (§4.2): AppText variants and CodeBlock. */
export function MarkdownBlockView({ block, context }: MarkdownBlockViewProps) {
  const { styles, variant, onLinkPress } = context;
  switch (block.kind) {
    case 'code':
      return <CodeBlock code={block.code} language={block.language} />;
    case 'list':
      return <ListBlock block={block} context={context} />;
    case 'quote':
      return (
        <View style={styles.quote}>
          {block.blocks.map((child, index) => (
            <MarkdownBlockView key={index} block={child} context={context} />
          ))}
        </View>
      );
    case 'heading':
      return (
        <AppText variant={headingVariant(block.level, variant)} bold accessibilityRole="header">
          <MarkdownInline spans={block.spans} styles={styles} onLinkPress={onLinkPress} />
        </AppText>
      );
    default:
      return (
        <AppText variant={variant}>
          <MarkdownInline spans={block.spans} styles={styles} onLinkPress={onLinkPress} />
        </AppText>
      );
  }
}
