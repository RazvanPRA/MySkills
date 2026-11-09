/** Text size of paragraphs: question text uses `title`, explanations `small`. */
export type MarkdownVariant = 'title' | 'body' | 'small';

export type MarkdownTextProps = {
  content: string;
  variant?: MarkdownVariant;
  /** Makes links pressable. Without it, links are shown as accent text only. */
  onLinkPress?: (url: string) => void;
};
