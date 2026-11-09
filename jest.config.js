/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Packages shipped as untranspiled ESM / Flow that Jest must run through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context|@reduxjs/toolkit|react-redux|redux|reselect|immer)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts', '!src/**/*.types.ts'],
};
