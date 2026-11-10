import { grammarFor, Prism } from './prism';

/** The only syntax roles the design system colors (§2.2); everything else is plain code text. */
export type SyntaxRole = 'plain' | 'keyword' | 'string' | 'number' | 'comment' | 'function';

export type CodeSpan = { text: string; role: SyntaxRole };
export type CodeLine = CodeSpan[];

const ROLE_BY_PRISM_TYPE: Record<string, SyntaxRole> = {
  keyword: 'keyword',
  boolean: 'keyword',
  builtin: 'keyword',
  important: 'keyword',
  string: 'string',
  'template-string': 'string',
  char: 'string',
  regex: 'string',
  'attr-value': 'string',
  number: 'number',
  comment: 'comment',
  prolog: 'comment',
  doctype: 'comment',
  function: 'function',
  'class-name': 'function',
};

type TokenStream = string | Prism.Token | (string | Prism.Token)[];

/** Flattens Prism's nested tokens; a nested token without a role inherits its parent's. */
function flatten(stream: TokenStream, inherited: SyntaxRole): CodeSpan[] {
  if (typeof stream === 'string') {
    return [{ text: stream, role: inherited }];
  }
  if (Array.isArray(stream)) {
    return stream.flatMap(part => flatten(part, inherited));
  }
  const role = ROLE_BY_PRISM_TYPE[stream.type] ?? inherited;
  return flatten(stream.content, role);
}

/** Splits spans on newlines into lines, merging neighbours with the same role. */
function toLines(spans: CodeSpan[]): CodeLine[] {
  const lines: CodeLine[] = [[]];
  for (const span of spans) {
    span.text.split('\n').forEach((text, index) => {
      if (index > 0) {
        lines.push([]);
      }
      const line = lines[lines.length - 1] as CodeLine;
      const previous = line[line.length - 1];
      if (previous?.role === span.role) {
        previous.text += text;
      } else if (text) {
        line.push({ text, role: span.role });
      }
    });
  }
  return lines;
}

/**
 * Pure: code → lines of colored spans. Unknown languages render as plain text.
 * A trailing newline does not create an empty last line.
 */
/** Tabs are expanded: React Native draws a tab about one space wide (Go code uses tabs). */
const TAB = '    ';

export function highlightCode(code: string, language?: string): CodeLine[] {
  const source = code.replace(/\r\n?/g, '\n').replace(/\n$/, '').replace(/\t/g, TAB);
  const grammar = grammarFor(language);
  const spans = grammar
    ? flatten(Prism.tokenize(source, grammar), 'plain')
    : [{ text: source, role: 'plain' as const }];
  return toLines(spans);
}
