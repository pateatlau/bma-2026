# Project Rules

## General

- This is a real production-style Expo project
- Code must be runnable, not illustrative
- Prefer correctness and clarity over cleverness

## Platform

- Target: Web, Android, iOS
- Use Expo SDK 54, React 19.1, React Native 0.81
- Use Expo Router for navigation
- One shared codebase for all platforms

## Restrictions

- Do NOT use web-only libraries (no react-router-dom, no Next.js)
- Do NOT use deprecated APIs
- Do NOT invent libraries

## Code Quality

- Maintain clean file structure
- Avoid duplicated logic
- Ensure navigation and providers are wired correctly
- Handle platform differences intentionally
- Run `npm run check` before committing (typecheck + lint + format:check)

## Formatting & Linting

- ESLint 9.x with flat config (`eslint.config.js`)
- Prettier for code formatting
- Run `npm run lint:fix` to auto-fix linting issues
- Run `npm run format` to format code

## Testing

- Unit tests: Jest + React Native Testing Library
- Integration tests: Jest + MSW for API mocking
- E2E (Web): Playwright
- E2E (Mobile): Maestro
- Run `npm run test` for unit tests
- Run `npm run test:integration` for integration tests

## UI

- Red, black, and white theme
- Clean, modern, professional look
- Avoid default-looking starter UI
- Use design system components from `/components`
- Use design tokens from `/constants/tokens`

## Behavior

- Think through architecture before writing code
- If unsure, resolve the uncertainty before outputting code
- Fix issues fully, not partially

## Documentation

- [DESIGN-SYSTEM-IMPLEMENTATION.md](docs/DESIGN-SYSTEM-IMPLEMENTATION.md) - Design system guide
- [PRETTIER-ESLINT-IMPLEMENTATION.md](docs/PRETTIER-ESLINT-IMPLEMENTATION.md) - Code quality setup
- [TESTING-IMPLEMENTATION-PLAN.md](docs/TESTING-IMPLEMENTATION-PLAN.md) - Testing strategy
- [CI-CD-IMPLEMENTATION-PLAN.md](docs/CI-CD-IMPLEMENTATION-PLAN.md) - CI/CD & deployment
- [ANDROID-DEPLOYMENT.md](docs/ANDROID-DEPLOYMENT.md) - Android/Play Store guide
- [IOS-DEPLOYMENT.md](docs/IOS-DEPLOYMENT.md) - iOS/App Store guide
