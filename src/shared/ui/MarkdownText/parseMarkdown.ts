import { Lexer, type Token, type Tokens } from 'marked';

/** Inline content. Emphasis is bold, never italic (design system §2.6). */
export type InlineSpan =
  | { kind: 'text'; text: string; bold: boolean }
  | { kind: 'code'; text: string }
  | { kind: 'link'; text: string; url: string }
  | { kind: 'break' };

export type MarkdownBlock =
  | { kind: 'heading'; level: number; spans: InlineSpan[] }
  | { kind: 'paragraph'; spans: InlineSpan[] }
  | { kind: 'code'; code: string; language?: string }
  | { kind: 'list'; ordered: boolean; start: number; items: MarkdownBlock[][] }
  | { kind: 'quote'; blocks: MarkdownBlock[] };

const childrenOf = (token: Token): Token[] =>
  'tokens' in token && Array.isArray(token.tokens) ? token.tokens : [];

const textOf = (token: Token): string =>
  'text' in token && typeof token.text === 'string' ? token.text : token.raw;

const plainText = (tokens: Token[]): string =>
  tokens
    .map(token => (childrenOf(token).length ? plainText(childrenOf(token)) : textOf(token)))
    .join('');

// ---------- Inline

type InlineHandler = (token: Token, bold: boolean) => InlineSpan[];

const inlineHandlers: Record<string, InlineHandler> = {
  strong: token => toSpans(childrenOf(token), true),
  em: token => toSpans(childrenOf(token), true),
  codespan: token => [{ kind: 'code', text: textOf(token) }],
  link: token => [
    { kind: 'link', text: plainText(childrenOf(token)), url: (token as Tokens.Link).href },
  ],
  br: () => [{ kind: 'break' }],
};

/** text, del, escape, html, image…: their children, or their text. */
const otherInline: InlineHandler = (token, bold) => {
  const children = childrenOf(token);
  return children.length ? toSpans(children, bold) : [{ kind: 'text', text: textOf(token), bold }];
};

function toSpans(tokens: Token[], bold = false): InlineSpan[] {
  return tokens.flatMap(token => (inlineHandlers[token.type] ?? otherInline)(token, bold));
}

// ---------- Blocks

type BlockHandler = (token: Token) => MarkdownBlock[];

const paragraph: BlockHandler = token => {
  const children = childrenOf(token);
  return [
    { kind: 'paragraph', spans: children.length ? toSpans(children) : otherInline(token, false) },
  ];
};

const blockHandlers: Record<string, BlockHandler> = {
  heading: token => [
    { kind: 'heading', level: (token as Tokens.Heading).depth, spans: toSpans(childrenOf(token)) },
  ],
  paragraph,
  // Items of a tight list hold "text" blocks with inline children.
  text: paragraph,
  code: token => {
    const { text, lang } = token as Tokens.Code;
    return [{ kind: 'code', code: text, ...(lang ? { language: lang } : {}) }];
  },
  list: token => {
    const list = token as Tokens.List;
    const start = typeof list.start === 'number' ? list.start : 1;
    return [
      {
        kind: 'list',
        ordered: list.ordered,
        start,
        items: list.items.map(item => toBlocks(item.tokens)),
      },
    ];
  },
  blockquote: token => [{ kind: 'quote', blocks: toBlocks(childrenOf(token)) }],
  space: () => [],
  hr: () => [],
};

/** Anything else (html, tables…) is shown as its source text rather than dropped. */
const otherBlock: BlockHandler = token => [
  { kind: 'paragraph', spans: [{ kind: 'text', text: token.raw.trim(), bold: false }] },
];

function toBlocks(tokens: Token[]): MarkdownBlock[] {
  return tokens.flatMap(token => (blockHandlers[token.type] ?? otherBlock)(token));
}

/** Pure: Markdown → a small block model that MarkdownText maps to AppText and CodeBlock. */
export const parseMarkdown = (content: string): MarkdownBlock[] => toBlocks(Lexer.lex(content));

const spanText = (span: InlineSpan): string => (span.kind === 'break' ? ' ' : span.text);

function blockText(block: MarkdownBlock): string {
  if (block.kind === 'code') {
    return block.code;
  }
  if (block.kind === 'list') {
    return block.items.map(item => item.map(blockText).join(' ')).join(', ');
  }
  if (block.kind === 'quote') {
    return block.blocks.map(blockText).join(' ');
  }
  return block.spans.map(spanText).join('');
}

/** Markdown → readable plain text, e.g. for accessibility labels ("`useEffect`" → "useEffect"). */
export const toPlainText = (content: string): string =>
  parseMarkdown(content).map(blockText).join(' ').trim();
