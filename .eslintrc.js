/**
 * ESLint enforces the `modular-architecture` and `senior-prep-design-system` skills mechanically:
 * layering and feature boundaries, size limits, no raw colors/inline styles, no hidden
 * time or randomness in services, and no direct storage access outside repositories.
 */
const FEATURE_ELEMENTS = ['feature', 'exercise-type', 'test-definition'];

const types = list => ({ element: { types: list } });
const allowLayer = (from, to) => ({ from: types(from), allow: [{ to: types(to) }] });

module.exports = {
  root: true,
  extends: ['@react-native'],
  plugins: ['boundaries', 'import-x'],
  ignorePatterns: [
    'android/',
    'coverage/',
    'node_modules/',
    '**/*.generated.ts',
    'src/db/migrations/',
  ],
  settings: {
    'import/resolver': { typescript: { project: './tsconfig.json' } },
    'import-x/resolver': { typescript: { project: './tsconfig.json' } },
    'boundaries/include': ['src/**/*'],
    // Order matters: the first matching descriptor wins.
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app' },
      { type: 'navigation', pattern: 'src/navigation' },
      { type: 'exercise-type', pattern: 'src/features/exercise-types/*', capture: ['name'] },
      { type: 'test-definition', pattern: 'src/features/test-definitions/*', capture: ['name'] },
      { type: 'feature', pattern: 'src/features/*', capture: ['name'] },
      { type: 'db', pattern: 'src/db' },
      // TurboModule specs (codegen); only the app's dependency container uses them.
      { type: 'native', pattern: 'src/native' },
      { type: 'shared', pattern: 'src/shared/*', capture: ['name'] },
    ],
  },
  rules: {
    // Policies are evaluated in order; the last matching one wins.
    'boundaries/dependencies': [
      2,
      {
        default: 'disallow',
        policies: [
          // Layers: dependencies only point downward (architecture §3).
          allowLayer(['app'], ['app', 'navigation', ...FEATURE_ELEMENTS, 'db', 'native', 'shared']),
          allowLayer(['native'], ['native']),
          allowLayer(['navigation'], ['navigation', ...FEATURE_ELEMENTS, 'shared']),
          allowLayer(FEATURE_ELEMENTS, [...FEATURE_ELEMENTS, 'db', 'shared']),
          allowLayer(['db'], ['db', 'shared']),
          allowLayer(['shared'], ['shared']),
          // Another module's internals are off limits: only its index.ts is public (§4).
          {
            disallow: [
              {
                to: { element: { types: FEATURE_ELEMENTS }, file: { path: '!**/index.{ts,tsx}' } },
              },
            ],
            message: 'Import {{ to.element.types.[0] }} modules only through their index.ts',
          },
          // Files inside the same module may import each other freely.
          { allow: [{ dependency: { relationship: { to: 'internal' } } }] },
        ],
      },
    ],
    'import-x/no-cycle': [2, { ignoreExternal: true }],

    // ---------- Size and complexity limits (architecture §2).
    'max-lines': [2, { max: 200, skipBlankLines: true, skipComments: true }],
    'max-params': [2, 3],
    complexity: [2, 10],
    'max-depth': [2, 3],
    'react/jsx-max-depth': [2, { max: 4 }],

    // ---------- Types (architecture §8).
    '@typescript-eslint/no-explicit-any': 2,
    '@typescript-eslint/no-non-null-assertion': 2,
    '@typescript-eslint/consistent-type-imports': [2, { fixStyle: 'inline-type-imports' }],

    // ---------- Styling (design system §2, §13).
    'react-native/no-inline-styles': 2,
    'react-native/no-color-literals': 2,
  },
  overrides: [
    {
      files: ['src/**/*.tsx'],
      excludedFiles: ['**/*.test.tsx'],
      rules: { 'max-lines': [2, { max: 150, skipBlankLines: true, skipComments: true }] },
    },
    {
      files: ['src/**/screens/**/*.tsx', 'src/**/*Screen.tsx'],
      excludedFiles: ['**/*.test.tsx'],
      rules: { 'max-lines': [2, { max: 120, skipBlankLines: true, skipComments: true }] },
    },
    {
      // Services: small pure functions, no hidden clock or randomness.
      files: [
        'src/**/services/**/*.ts',
        'src/**/*.service.ts',
        'src/features/test-definitions/**/*.ts',
      ],
      excludedFiles: ['**/__tests__/**', '**/*.test.ts'],
      rules: {
        'max-lines-per-function': [2, { max: 40, skipBlankLines: true, skipComments: true }],
        'no-restricted-syntax': [
          2,
          {
            selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
            message: 'Inject a Clock instead of calling Date.now() in a service.',
          },
          {
            selector: "NewExpression[callee.name='Date'][arguments.length=0]",
            message: 'Inject a Clock instead of calling new Date() in a service.',
          },
          {
            selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
            message: 'Pass a seed / random source instead of calling Math.random() in a service.',
          },
        ],
      },
    },
    {
      files: ['src/**/use*.ts', 'src/**/use*.tsx'],
      excludedFiles: ['**/*.test.*'],
      rules: {
        'max-lines-per-function': [2, { max: 80, skipBlankLines: true, skipComments: true }],
      },
    },
    {
      // Feature and navigation code uses the primitives, never raw RN text or touchables.
      files: ['src/features/**/*.tsx', 'src/navigation/**/*.tsx'],
      excludedFiles: ['**/*.test.tsx'],
      rules: {
        'no-restricted-imports': [
          2,
          {
            paths: [
              {
                name: 'react-native',
                importNames: ['Text', 'TouchableOpacity', 'TouchableHighlight', 'Button'],
                message: 'Use AppText / Button / Chip / ListRow from @/shared/ui.',
              },
            ],
          },
        ],
      },
    },
    {
      // Storage is reached only through repositories (architecture §11).
      files: ['src/**/*.{ts,tsx}'],
      excludedFiles: [
        'src/**/repository/**',
        'src/db/**',
        'src/app/dependencies.ts',
        '**/__tests__/**',
        '**/*.test.*',
      ],
      rules: {
        'no-restricted-imports': [
          2,
          {
            patterns: [
              {
                group: [
                  '@react-native-async-storage/*',
                  '@op-engineering/op-sqlite',
                  'drizzle-orm',
                  'drizzle-orm/*',
                ],
                message: 'Access storage only through a repository.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', 'jest/**'],
      env: { jest: true },
      rules: {
        'max-lines': 0,
        'react-native/no-inline-styles': 0,
        'react-native/no-color-literals': 0,
      },
    },
    {
      files: ['*.js', 'scripts/**/*'],
      rules: { '@typescript-eslint/consistent-type-imports': 0 },
    },
    {
      // Plain Node ES modules (build helpers): parse with espree, not the RN Babel parser.
      files: ['*.mjs', 'scripts/**/*.mjs'],
      parser: 'espree',
      parserOptions: { ecmaVersion: 2024, sourceType: 'module' },
      env: { node: true, es2024: true },
    },
  ],
};
