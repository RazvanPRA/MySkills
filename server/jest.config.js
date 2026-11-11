/** Unit tests: fast, no database. They live next to the code in __tests__/. */
/** @type {import('jest').Config} */
module.exports = {
  rootDir: 'src',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  transform: { '^.+.ts$': ['@swc/jest'] },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
