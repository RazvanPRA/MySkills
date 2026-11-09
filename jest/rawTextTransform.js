// Jest transform: exports a file's text as a string (used for .sql migrations).
module.exports = {
  process(sourceText) {
    return { code: `module.exports = ${JSON.stringify(sourceText)};` };
  },
};
