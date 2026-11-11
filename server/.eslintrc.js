/**
 * Server lint rules: TypeScript-aware, no React Native rules. The app's config (repo root)
 * ignores server/ and packages/.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, jest: true, es2023: true },
  ignorePatterns: [
    'dist/',
    'src/generated/',
    '.eslintrc.js',
    'jest.config.js',
    'test/jest-e2e.config.js',
  ],
  rules: {
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
    'max-params': ['error', 4],
    complexity: ['error', 10],
  },
  overrides: [
    {
      // NestJS injects constructor dependencies by type: type-only imports would erase them.
      files: ['src/**/*.ts'],
      rules: { '@typescript-eslint/consistent-type-imports': 'off' },
    },
  ],
};
