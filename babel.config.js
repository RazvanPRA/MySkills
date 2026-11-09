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
};
