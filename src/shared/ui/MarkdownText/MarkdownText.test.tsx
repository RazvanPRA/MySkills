import { fireEvent, screen } from '@testing-library/react-native';
import { fontFamily, lightColors, typography } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { MarkdownText } from './MarkdownText';
import { parseMarkdown } from './parseMarkdown';

describe('parseMarkdown', () => {
  it('maps paragraphs with bold, emphasis (as bold), inline code and links', () => {
    expect(parseMarkdown('Use **`useMemo`** _only_ when [measured](https://react.dev).')).toEqual([
      {
        kind: 'paragraph',
        spans: [
          { kind: 'text', text: 'Use ', bold: false },
          { kind: 'code', text: 'useMemo' },
          { kind: 'text', text: ' ', bold: false },
          { kind: 'text', text: 'only', bold: true },
          { kind: 'text', text: ' when ', bold: false },
          { kind: 'link', text: 'measured', url: 'https://react.dev' },
          { kind: 'text', text: '.', bold: false },
        ],
      },
    ]);
  });

  it('keeps raw characters (no HTML escaping) in text and code', () => {
    const [block] = parseMarkdown('`a < b && c` & <T>');
    expect(block).toEqual({
      kind: 'paragraph',
      spans: [
        { kind: 'code', text: 'a < b && c' },
        { kind: 'text', text: ' & ', bold: false },
        { kind: 'text', text: '<T>', bold: false },
      ],
    });
  });

  it('maps fenced code with its language, headings and line breaks', () => {
    expect(parseMarkdown('## Title\n\n```ts\nconst a = 1;\n```\n\nx  \ny')).toEqual([
      { kind: 'heading', level: 2, spans: [{ kind: 'text', text: 'Title', bold: false }] },
      { kind: 'code', code: 'const a = 1;', language: 'ts' },
      {
        kind: 'paragraph',
        spans: [
          { kind: 'text', text: 'x', bold: false },
          { kind: 'break' },
          { kind: 'text', text: 'y', bold: false },
        ],
      },
    ]);
  });

  it('maps ordered and nested lists', () => {
    const [list] = parseMarkdown('3. three\n4. four\n   - nested');
    expect(list).toMatchObject({ kind: 'list', ordered: true, start: 3 });
    const items = list?.kind === 'list' ? list.items : [];
    expect(items[1]?.[1]).toMatchObject({ kind: 'list', ordered: false, start: 1 });
  });

  it('keeps unsupported blocks as their source text instead of dropping them', () => {
    expect(parseMarkdown('| a | b |\n| - | - |\n| 1 | 2 |')[0]).toMatchObject({
      kind: 'paragraph',
    });
    expect(parseMarkdown('')).toEqual([]);
  });
});

describe('MarkdownText', () => {
  it('renders paragraphs in the requested variant with inline code in the code font', async () => {
    await renderWithTheme(<MarkdownText content="Folosește `useEffect` aici." variant="title" />);
    expect(screen.getByText('useEffect')).toHaveStyle({
      fontFamily: fontFamily.mono,
      color: lightColors.codeText,
    });
    expect(screen.getByText(/Folosește/)).toHaveStyle({ fontSize: typography.title.fontSize });
  });

  it('renders fenced code as a highlighted CodeBlock', async () => {
    await renderWithTheme(<MarkdownText content={'```js\nreturn 1;\n```'} />);
    expect(screen.getByText('return')).toHaveStyle({ color: lightColors.syntaxKeyword });
  });

  it('marks headings with the header role', async () => {
    await renderWithTheme(<MarkdownText content="### Capcane" />);
    expect(screen.getByRole('header', { name: 'Capcane' })).toBeOnTheScreen();
  });

  it('renders list markers', async () => {
    await renderWithTheme(<MarkdownText content={'- unu\n- doi'} />);
    expect(screen.getAllByText('•')).toHaveLength(2);
    expect(screen.getByText('doi')).toBeOnTheScreen();
  });

  it('makes links pressable only when a handler is given', async () => {
    const onLinkPress = jest.fn();
    await renderWithTheme(
      <MarkdownText content="[docs](https://react.dev)" onLinkPress={onLinkPress} />,
    );
    await fireEvent.press(screen.getByRole('link', { name: 'docs' }));
    expect(onLinkPress).toHaveBeenCalledWith('https://react.dev');
  });

  it('shows links as plain accent text without a handler', async () => {
    await renderWithTheme(<MarkdownText content="[docs](https://react.dev)" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('docs')).toHaveStyle({ color: lightColors.accent });
  });
});

describe('MarkdownText inline sizes', () => {
  it('keeps bold, inline code and links at the paragraph size', async () => {
    await renderWithTheme(
      <MarkdownText content="Text **gras**, `cod` și [link](https://x.dev)." variant="small" />,
    );
    for (const text of ['gras', 'cod', 'link']) {
      expect(screen.getByText(text)).toHaveStyle({ fontSize: typography.small.fontSize });
    }
  });
});
