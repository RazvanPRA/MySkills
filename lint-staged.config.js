const { ESLint } = require('eslint');

const quote = files => files.map(file => JSON.stringify(file)).join(' ');

/** Drops files ESLint ignores (generated code), which would otherwise fail --max-warnings 0. */
async function lintable(files) {
  const eslint = new ESLint();
  const ignored = await Promise.all(files.map(file => eslint.isPathIgnored(file)));
  return files.filter((_, index) => !ignored[index]);
}

module.exports = {
  '*.{ts,tsx,js,mjs}': async files => {
    const toLint = await lintable(files);
    return [
      ...(toLint.length ? [`eslint --max-warnings 0 ${quote(toLint)}`] : []),
      `prettier --write --ignore-unknown ${quote(files)}`,
    ];
  },
  '*.{json,md,yml,yaml}': files => `prettier --write --ignore-unknown ${quote(files)}`,
};
