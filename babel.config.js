module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // zod 4's ESM build uses `export * as ns from`, which the RN preset does not transform.
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: { '@': './src', '@content': './content' },
      },
    ],
    // Drizzle migrations import .sql files; inline them as strings in the bundle.
    ['inline-import', { extensions: ['.sql'] }],
  ],
  env: {
    // Jest runs CommonJS: lazy screens and renderers use import(), which Metro bundles natively.
    test: { plugins: ['@babel/plugin-transform-dynamic-import'] },
  },
  overrides: [
    {
      // marked composes regexes with named groups; see babel/preserveNamedCaptureGroups.js.
      test: /[\\/]node_modules[\\/]marked[\\/]/,
      plugins: ['./babel/preserveNamedCaptureGroups'],
    },
  ],
};
