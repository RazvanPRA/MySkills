import { screen } from '@testing-library/react-native';
import { darkColors, fontFamily, lightColors } from '@/shared/theme';
import { renderWithTheme } from '@/shared/testing/renderWithTheme';
import { CodeBlock } from './CodeBlock';
import { highlightCode } from './highlightCode';

const roles = (code: string, language?: string) =>
  highlightCode(code, language).map(line => line.map(span => `${span.role}:${span.text}`));

describe('highlightCode', () => {
  it('maps Prism tokens to the design system roles', () => {
    const [line] = highlightCode('const n = 42; // answer', 'ts');
    expect(line).toEqual(
      expect.arrayContaining([
        { text: 'const', role: 'keyword' },
        { text: '42', role: 'number' },
        { text: '// answer', role: 'comment' },
      ]),
    );
  });

  it('marks strings and function names', () => {
    const spans = highlightCode("log('hi')", 'javascript').flat();
    expect(spans).toContainEqual({ text: 'log', role: 'function' });
    expect(spans).toContainEqual({ text: "'hi'", role: 'string' });
  });

  it.each([
    ['java', 'public class A {}', 'public'],
    ['go', 'func main() {}', 'func'],
    ['sql', 'SELECT 1', 'SELECT'],
    ['tsx', 'const a = <View />;', 'const'],
    ['py', 'def f(): pass', 'def'],
    ['golang', 'go f()', 'go'],
  ])('supports %s', (language, code, keyword) => {
    expect(highlightCode(code, language).flat()).toContainEqual({ text: keyword, role: 'keyword' });
  });

  it('splits multi-line tokens into lines and drops one trailing newline', () => {
    expect(roles('/* a\nb */\nx\n', 'js')).toEqual([
      ['comment:/* a'],
      ['comment:b */'],
      ['plain:x'],
    ]);
  });

  it('keeps empty lines and indentation', () => {
    expect(roles('a\n\n  b')).toEqual([['plain:a'], [], ['plain:  b']]);
  });

  it('renders unknown or missing languages as plain text', () => {
    expect(roles('SELECT 1', 'cobol')).toEqual([['plain:SELECT 1']]);
    expect(roles('x = 1')).toEqual([['plain:x = 1']]);
  });

  it('normalizes Windows line endings', () => {
    expect(roles('a\r\nb')).toEqual([['plain:a'], ['plain:b']]);
  });
});

describe('CodeBlock', () => {
  it('renders every line in the monospace code style with syntax colors', async () => {
    await renderWithTheme(<CodeBlock code={'const x = 1;\nreturn x;'} language="ts" />);
    expect(screen.getByText('const')).toHaveStyle({
      color: lightColors.syntaxKeyword,
      fontFamily: fontFamily.mono,
    });
    expect(screen.getByText('return')).toBeOnTheScreen();
  });

  it('uses the dark code colors in the dark scheme', async () => {
    await renderWithTheme(<CodeBlock code="let a = 'b';" language="js" />, 'dark');
    expect(screen.getByText("'b'")).toHaveStyle({ color: darkColors.syntaxString });
  });

  it('shows line numbers when asked, hidden from screen readers', async () => {
    await renderWithTheme(<CodeBlock code={'a\nb'} showLineNumbers />);
    expect(screen.getByText('2')).toHaveStyle({ color: lightColors.muted });
    expect(screen.getByText('2').props.importantForAccessibility).toBe('no');
  });

  it('scrolls horizontally instead of wrapping', async () => {
    await renderWithTheme(<CodeBlock code="x" />);
    // root = the frame; its only child is the horizontal ScrollView holding the lines.
    const scroller = screen.root?.children[0];
    expect(typeof scroller === 'object' && scroller?.props.horizontal).toBe(true);
    expect(scroller).toContainElement(screen.getByText('x'));
  });
});
