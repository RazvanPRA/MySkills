/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@content/(.*)$': '<rootDir>/content/$1',
  },
  transform: {
    // SQL migrations are imported as strings, like babel-plugin-inline-import does in the app.
    // Merged with the preset's transforms (babel-jest for js/ts, assets).
    '\\.sql$': '<rootDir>/jest/rawTextTransform.js',
  },
  // Packages shipped as untranspiled ESM / Flow that Jest must run through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|@reduxjs/toolkit|react-redux|redux|reselect|immer|zod|marked)/)',
  ],
  // Only *.test.ts(x) files are suites, so __tests__/ can also hold fixtures and helpers.
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/scripts/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/android/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts', '!src/**/*.types.ts'],
};
