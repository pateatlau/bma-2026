const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Expo's flat config (includes TypeScript, React, React Hooks, Expo rules)
  ...expoConfig,

  // Prettier integration - uses recommended config which:
  // 1. Adds prettier plugin
  // 2. Sets 'prettier/prettier': 'error'
  // 3. Disables conflicting ESLint rules (via eslint-config-prettier)
  eslintPluginPrettier,

  // Project-specific configuration for all JS/TS files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Console statements - warn in development
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // TypeScript-specific overrides (plugin only available for TS files)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Jest setup file - add jest globals
  {
    files: ['jest.setup.js', 'jest.config.js', '**/__tests__/**/*', '**/__mocks__/**/*'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },

  // Global ignores
  {
    ignores: [
      'node_modules/',
      'dist/',
      'web-build/',
      '.expo/',
      'android/',
      'ios/',
      'coverage/',
      '*.min.js',
      '*.bundle.js',
      'babel.config.js',
      'metro.config.js',
      'playwright-report/',
      'playwright-results/',
    ],
  },
];
