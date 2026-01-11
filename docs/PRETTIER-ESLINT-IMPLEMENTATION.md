# Prettier & ESLint Implementation Guide

This document provides a comprehensive guide for implementing Prettier and ESLint in the BMA 2026 Expo project. It ensures consistent code formatting, enforces best practices, and maintains code quality across all contributors.

## Implementation Status

| Phase   | Description                  | Status       |
| ------- | ---------------------------- | ------------ |
| Phase 1 | Install dependencies         | ✅ Completed |
| Phase 2 | Configure Prettier           | ✅ Completed |
| Phase 3 | Configure ESLint             | ✅ Completed |
| Phase 4 | NPM scripts                  | ✅ Completed |
| Phase 5 | IDE/Editor integration       | ✅ Completed |
| Phase 6 | Pre-commit hooks (optional)  | ⏳ Deferred  |
| Phase 7 | CI/CD integration (optional) | ⏳ Deferred  |

---

## Overview

**Goal**: Establish consistent code formatting and linting rules across the entire codebase to improve readability, maintainability, and catch potential bugs early.

**Tools**:

- **Prettier** - Opinionated code formatter for consistent style
- **ESLint** - JavaScript/TypeScript linter for catching errors and enforcing best practices
- **eslint-config-expo** - Expo's official ESLint configuration
- **eslint-config-prettier** - Disables ESLint rules that conflict with Prettier

**Design Principles**:

1. **Consistency** - Same formatting rules for all code
2. **Automation** - Format on save, lint on commit
3. **Non-intrusive** - Rules should enhance productivity, not hinder it
4. **Expo-compatible** - Use Expo's recommended configurations
5. **TypeScript-aware** - Proper type checking and linting

---

## Phase 1: Install Dependencies

### Required Packages

```bash
npm install --save-dev \
  prettier \
  eslint \
  eslint-config-expo \
  eslint-config-prettier \
  eslint-plugin-prettier \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser
```

### Package Descriptions

| Package                            | Version | Purpose                           |
| ---------------------------------- | ------- | --------------------------------- |
| `prettier`                         | ^3.x    | Code formatter                    |
| `eslint`                           | ^9.x    | Linter (flat config)              |
| `eslint-config-expo`               | ^8.x    | Expo's ESLint preset              |
| `eslint-config-prettier`           | ^10.x   | Disables conflicting ESLint rules |
| `eslint-plugin-prettier`           | ^5.x    | Runs Prettier as ESLint rule      |
| `@typescript-eslint/eslint-plugin` | ^8.x    | TypeScript-specific linting rules |
| `@typescript-eslint/parser`        | ^8.x    | TypeScript parser for ESLint      |

### Updated package.json

After installation, the `devDependencies` section should include:

```json
{
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~19.1.10",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "eslint-config-expo": "^8.0.0",
    "eslint-config-prettier": "^10.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "prettier": "^3.0.0",
    "typescript": "~5.9.2"
  }
}
```

---

## Phase 2: Configure Prettier

### Create .prettierrc

**File**: `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "printWidth": 100,
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "proseWrap": "preserve"
}
```

### Configuration Explanation

| Option            | Value      | Rationale                                   |
| ----------------- | ---------- | ------------------------------------------- |
| `semi`            | `true`     | Explicit semicolons prevent ASI issues      |
| `singleQuote`     | `true`     | Consistent with React Native conventions    |
| `tabWidth`        | `2`        | Standard for JavaScript/TypeScript          |
| `useTabs`         | `false`    | Spaces for consistent rendering             |
| `trailingComma`   | `"es5"`    | Cleaner git diffs, ES5 compatible           |
| `bracketSpacing`  | `true`     | `{ foo }` is more readable than `{foo}`     |
| `bracketSameLine` | `false`    | JSX closing bracket on new line             |
| `arrowParens`     | `"always"` | Consistent arrow function syntax            |
| `printWidth`      | `100`      | Balance between readability and line length |
| `endOfLine`       | `"lf"`     | Consistent line endings (Unix-style)        |
| `jsxSingleQuote`  | `false`    | Double quotes in JSX (HTML convention)      |

### Create .prettierignore

**File**: `.prettierignore`

```
# Dependencies
node_modules/

# Build outputs
dist/
web-build/
.expo/

# Native builds
android/
ios/

# Package manager
package-lock.json
yarn.lock
pnpm-lock.yaml

# Generated files
*.min.js
*.bundle.js
coverage/

# Environment files
.env*

# Cache
.cache/
*.tsbuildinfo
```

---

## Phase 3: Configure ESLint

### Create eslint.config.js (Flat Config)

ESLint 9.x uses the new flat configuration format. Create the file at the project root.

**File**: `eslint.config.js`

```javascript
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = defineConfig([
  // Expo's base configuration (includes React, React Native, TypeScript rules)
  expoConfig,

  // Prettier integration
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Disable rules that conflict with Prettier
  prettierConfig,

  // Project-specific overrides
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/display-name': 'off', // Anonymous components are fine

      // React Native rules
      'react-native/no-inline-styles': 'warn', // Prefer StyleSheet
      'react-native/no-unused-styles': 'warn', // Clean up unused styles
      'react-native/split-platform-components': 'warn', // Platform-specific files

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // Test files - relaxed rules
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      'dist/',
      'web-build/',
      '.expo/',
      'android/',
      'ios/',
      'coverage/',
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
    ],
  },
]);
```

### ESLint Rules Explanation

#### TypeScript Rules

| Rule                                         | Setting | Rationale                                             |
| -------------------------------------------- | ------- | ----------------------------------------------------- |
| `@typescript-eslint/no-unused-vars`          | `warn`  | Allow underscore-prefixed vars (intentionally unused) |
| `@typescript-eslint/no-explicit-any`         | `warn`  | Encourage type safety, but allow escape hatch         |
| `@typescript-eslint/consistent-type-imports` | `error` | Use `type` imports for types (tree-shaking)           |

#### React Rules

| Rule                       | Setting | Rationale                              |
| -------------------------- | ------- | -------------------------------------- |
| `react/react-in-jsx-scope` | `off`   | React 17+ doesn't require React import |
| `react/prop-types`         | `off`   | TypeScript handles prop validation     |
| `react/display-name`       | `off`   | Not needed for functional components   |

#### React Native Rules

| Rule                                     | Setting | Rationale                         |
| ---------------------------------------- | ------- | --------------------------------- |
| `react-native/no-inline-styles`          | `warn`  | Prefer StyleSheet for performance |
| `react-native/no-unused-styles`          | `warn`  | Keep stylesheets clean            |
| `react-native/split-platform-components` | `warn`  | Proper platform-specific code     |

#### General Rules

| Rule           | Setting | Rationale                            |
| -------------- | ------- | ------------------------------------ |
| `no-console`   | `warn`  | Allow warn/error, warn on log/info   |
| `prefer-const` | `error` | Immutability by default              |
| `no-var`       | `error` | Use const/let instead                |
| `eqeqeq`       | `error` | Strict equality (except null checks) |

---

## Phase 4: NPM Scripts

### Update package.json Scripts

Add linting and formatting scripts to `package.json`:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run lint && npm run format:check"
  }
}
```

### Script Descriptions

| Script         | Purpose                            |
| -------------- | ---------------------------------- |
| `lint`         | Run ESLint on all TypeScript files |
| `lint:fix`     | Run ESLint with auto-fix           |
| `format`       | Format all files with Prettier     |
| `format:check` | Check if files are formatted (CI)  |
| `typecheck`    | Run TypeScript type checking       |
| `check`        | Run all checks (CI-friendly)       |

---

## Phase 5: IDE/Editor Integration

### VS Code Configuration

Create or update `.vscode/settings.json`:

**File**: `.vscode/settings.json`

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Recommended VS Code Extensions

Create `.vscode/extensions.json`:

**File**: `.vscode/extensions.json`

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Cursor IDE Configuration

Cursor uses VS Code settings. The same `.vscode/settings.json` will work.

### WebStorm/IntelliJ Configuration

1. **Prettier**:
   - Go to `Preferences > Languages & Frameworks > JavaScript > Prettier`
   - Set Prettier package to `node_modules/prettier`
   - Enable "On save" and "On 'Reformat Code' action"

2. **ESLint**:
   - Go to `Preferences > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint`
   - Select "Automatic ESLint configuration"
   - Enable "Run eslint --fix on save"

---

## Phase 6: Pre-commit Hooks (Optional)

### Using Husky and lint-staged

Install additional dependencies:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

### Configure lint-staged

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx,json,md}": ["prettier --write"]
  }
}
```

### Create Husky Pre-commit Hook

**File**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### Alternative: simple-git-hooks

For a lighter alternative:

```bash
npm install --save-dev simple-git-hooks
```

Add to `package.json`:

```json
{
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged"
  }
}
```

Then run:

```bash
npx simple-git-hooks
```

---

## Phase 7: CI/CD Integration (Optional)

### GitHub Actions Workflow

**File**: `.github/workflows/lint.yml`

```yaml
name: Lint & Type Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run typecheck

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check
```

---

## File Structure After Implementation

```
BMA-2026/
├── .eslintrc.js              # ESLint configuration (flat config)
├── .prettierrc               # Prettier configuration
├── .prettierignore           # Files to ignore for Prettier
├── .vscode/
│   ├── settings.json         # VS Code workspace settings
│   └── extensions.json       # Recommended extensions
├── .husky/                   # Git hooks (optional)
│   └── pre-commit
├── .github/
│   └── workflows/
│       └── lint.yml          # CI workflow (optional)
├── package.json              # Updated with lint scripts
└── ... (other project files)
```

---

## Implementation Steps Summary

### Step 1: Install Dependencies

```bash
npm install --save-dev prettier eslint eslint-config-expo eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Step 2: Create Configuration Files

1. Create `.prettierrc`
2. Create `.prettierignore`
3. Create `eslint.config.js`

### Step 3: Update package.json

Add lint and format scripts.

### Step 4: IDE Configuration

1. Create `.vscode/settings.json`
2. Create `.vscode/extensions.json`
3. Install recommended extensions

### Step 5: Initial Format

Run initial formatting on entire codebase:

```bash
npm run format
npm run lint:fix
```

### Step 6: Verify

```bash
npm run check
```

---

## Troubleshooting

### Common Issues

#### Issue: ESLint not finding config

**Solution**: Ensure `eslint.config.js` is at project root and using correct export syntax.

#### Issue: Prettier and ESLint conflict

**Solution**: Ensure `eslint-config-prettier` is the last config in the extends array.

#### Issue: TypeScript errors in ESLint

**Solution**: Ensure `@typescript-eslint/parser` is installed and tsconfig.json is valid.

#### Issue: Format on save not working

**Solution**: Check VS Code settings, ensure Prettier extension is installed and set as default formatter.

#### Issue: Pre-commit hook not running

**Solution**: Run `npx husky install` or `npx simple-git-hooks` after cloning.

---

## Migration Notes

### Running Initial Format

When first implementing, the format command will modify many files. To minimize disruption:

1. Create a dedicated "formatting" commit
2. Run `npm run format` once
3. Commit all changes with message: "chore: apply prettier formatting"
4. This creates a clean baseline for future diffs

### Handling Existing Code

Some files may have intentional formatting. Use Prettier ignore comments sparingly:

```typescript
// prettier-ignore
const matrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
```

Or ignore entire files by adding to `.prettierignore`.

---

## Rules Reference

### Prettier Rules Quick Reference

| Category            | Rule              | Our Setting |
| ------------------- | ----------------- | ----------- |
| **Semicolons**      | `semi`            | `true`      |
| **Quotes**          | `singleQuote`     | `true`      |
| **Indentation**     | `tabWidth`        | `2`         |
| **Line Length**     | `printWidth`      | `100`       |
| **Trailing Commas** | `trailingComma`   | `"es5"`     |
| **Brackets**        | `bracketSpacing`  | `true`      |
| **JSX Brackets**    | `bracketSameLine` | `false`     |
| **Arrow Functions** | `arrowParens`     | `"always"`  |
| **Line Endings**    | `endOfLine`       | `"lf"`      |

### ESLint Rules Quick Reference

| Category             | Rule                                         | Setting |
| -------------------- | -------------------------------------------- | ------- |
| **Unused Variables** | `@typescript-eslint/no-unused-vars`          | `warn`  |
| **Any Type**         | `@typescript-eslint/no-explicit-any`         | `warn`  |
| **Type Imports**     | `@typescript-eslint/consistent-type-imports` | `error` |
| **Console**          | `no-console`                                 | `warn`  |
| **Const**            | `prefer-const`                               | `error` |
| **Equality**         | `eqeqeq`                                     | `error` |
| **Inline Styles**    | `react-native/no-inline-styles`              | `warn`  |

---

## Dependencies Summary

### Production Dependencies

None required.

### Development Dependencies

| Package                            | Version | Required |
| ---------------------------------- | ------- | -------- |
| `prettier`                         | ^3.x    | Yes      |
| `eslint`                           | ^9.x    | Yes      |
| `eslint-config-expo`               | ^8.x    | Yes      |
| `eslint-config-prettier`           | ^10.x   | Yes      |
| `eslint-plugin-prettier`           | ^5.x    | Yes      |
| `@typescript-eslint/eslint-plugin` | ^8.x    | Yes      |
| `@typescript-eslint/parser`        | ^8.x    | Yes      |
| `husky`                            | ^9.x    | Optional |
| `lint-staged`                      | ^15.x   | Optional |

---

## Related Documentation

- [Expo ESLint Guide](https://docs.expo.dev/guides/using-eslint/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
