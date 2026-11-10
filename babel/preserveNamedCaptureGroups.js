/**
 * Keeps named capture groups intact in selected dependencies.
 *
 * @react-native/babel-preset always applies @babel/plugin-transform-named-capturing-groups-regex,
 * which rewrites `(?<a>…)…\k<a>` into `(…)…\1`. That is only safe for a regex used on its own.
 * marked composes larger regexes from smaller ones through `.source`; once embedded, `\1` points
 * at the wrong group and inline code inside bold text stops parsing. Hermes supports named
 * groups natively, so a literal that contains one becomes `new RegExp(pattern, flags)`, which
 * the preset's literal-only transform leaves alone.
 */
const NAMED_GROUP = /\(\?<[A-Za-z_$][\w$]*>/;

module.exports = ({ types: t }) => ({
  name: 'preserve-named-capture-groups',
  visitor: {
    RegExpLiteral(path) {
      const { pattern, flags } = path.node;
      if (!NAMED_GROUP.test(pattern)) {
        return;
      }
      path.replaceWith(
        t.newExpression(t.identifier('RegExp'), [t.stringLiteral(pattern), t.stringLiteral(flags)]),
      );
    },
  },
});
