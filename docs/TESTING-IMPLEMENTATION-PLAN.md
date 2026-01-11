# Testing Implementation Plan

This document outlines the comprehensive testing strategy for the BMA 2026 Expo project, covering Unit Testing, Integration Testing, and End-to-End (E2E) Testing across Web, Android, and iOS platforms.

## Implementation Status

| Phase   | Description                        | Status       |
| ------- | ---------------------------------- | ------------ |
| Phase 1 | Testing infrastructure setup       | ✅ Completed |
| Phase 2 | Unit testing framework             | ✅ Completed |
| Phase 3 | Integration testing framework      | ✅ Completed |
| Phase 4 | E2E testing framework              | ✅ Completed |
| Phase 5 | CI/CD integration                  | ✅ Completed |
| Phase 6 | Coverage reporting & quality gates | ⏳ Pending   |

---

## Executive Summary

### Testing Pyramid Strategy

```
                    ┌─────────────┐
                   /   E2E Tests   \          Few, Slow, Expensive
                  /   (Maestro/     \         - Critical user flows
                 /    Detox)         \        - Smoke tests
                ├─────────────────────┤
               /   Integration Tests   \      Medium, Moderate
              /   (Jest + RTL +         \     - API integration
             /    MSW for mocking)       \    - Component interactions
            ├─────────────────────────────┤
           /        Unit Tests             \  Many, Fast, Cheap
          /    (Jest + React Native        \  - Business logic
         /      Testing Library)            \ - Utility functions
        └───────────────────────────────────┘  - Individual components
```

### Recommended Stack

| Test Type        | Framework               | Cost | Rationale                          |
| ---------------- | ----------------------- | ---- | ---------------------------------- |
| **Unit**         | Jest + RNTL             | Free | Industry standard, Expo compatible |
| **Integration**  | Jest + RNTL + MSW       | Free | API mocking, component integration |
| **E2E (Web)**    | Playwright              | Free | Fast, reliable, cross-browser      |
| **E2E (Mobile)** | Maestro                 | Free | Simple YAML syntax, cross-platform |
| **Coverage**     | Jest built-in + Codecov | Free | Coverage tracking and PR comments  |

### Test Execution Strategy

| Trigger            | Unit Tests | Integration Tests | E2E Tests |
| ------------------ | ---------- | ----------------- | --------- |
| PR Creation/Update | ✅ Run     | ✅ Run            | ❌ Skip   |
| Push to `main`     | ✅ Run     | ✅ Run            | ✅ Web    |
| Tag push (`v*`)    | ✅ Run     | ✅ Run            | ✅ All    |
| Manual trigger     | ✅ Run     | ✅ Run            | ✅ All    |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TEST INFRASTRUCTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Unit Tests    │  │Integration Tests│  │       E2E Tests             │  │
│  │                 │  │                 │  │                             │  │
│  │  Jest           │  │  Jest           │  │  Web: Playwright            │  │
│  │  RNTL           │  │  RNTL           │  │  Mobile: Maestro            │  │
│  │                 │  │  MSW            │  │                             │  │
│  │  __tests__/     │  │  __tests__/     │  │  e2e/                       │  │
│  │  *.test.ts      │  │  *.integration  │  │  *.e2e.ts (web)            │  │
│  │                 │  │  .test.ts       │  │  *.yaml (mobile)           │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────────┬──────────────┘  │
│           │                    │                          │                  │
│           ▼                    ▼                          ▼                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        Coverage Reports                                 ││
│  │                    Jest Coverage + Codecov                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Testing Infrastructure Setup

### Dependencies Installation

```bash
# Core testing dependencies
npm install --save-dev \
  jest \
  @types/jest \
  jest-expo \
  @testing-library/react-native \
  @testing-library/jest-native \
  msw

# E2E testing (Web)
npm install --save-dev \
  @playwright/test

# E2E testing (Mobile) - Maestro CLI installed separately
# brew install maestro (macOS)
# curl -Ls "https://get.maestro.mobile.dev" | bash (Linux)
```

### Package Descriptions

| Package                         | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `jest`                          | Test runner                                 |
| `jest-expo`                     | Expo-specific Jest preset                   |
| `@testing-library/react-native` | React Native component testing utilities    |
| `@testing-library/jest-native`  | Custom Jest matchers for React Native       |
| `msw`                           | API mocking for integration tests           |
| `@playwright/test`              | E2E testing for web                         |
| `maestro` (CLI)                 | E2E testing for mobile (installed globally) |

### Updated devDependencies

After installation, `package.json` devDependencies should include:

```json
{
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@playwright/test": "^1.57.0",
    "@testing-library/jest-native": "^5.4.3",
    "@testing-library/react-native": "^13.3.3",
    "@types/jest": "^30.0.0",
    "@types/react": "~19.1.10",
    "@typescript-eslint/eslint-plugin": "^8.52.0",
    "@typescript-eslint/parser": "^8.52.0",
    "eslint": "^9.39.2",
    "eslint-config-expo": "^10.0.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.4",
    "husky": "^9.1.7",
    "jest": "^30.2.0",
    "jest-expo": "^54.0.16",
    "lint-staged": "^16.2.7",
    "msw": "^2.12.7",
    "prettier": "^3.7.4",
    "typescript": "~5.9.2"
  }
}
```

---

## Phase 2: Unit Testing Framework

### Jest Configuration

**File**: `jest.config.js`

```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',

  // Test file patterns
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // Ignore integration and E2E tests in unit test runs
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
    '/dist/',
    '/web-build/',
    '\\.integration\\.test\\.[jt]sx?$',
    '\\.e2e\\.[jt]sx?$',
    '/e2e/',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Transform settings
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.expo/**',
    '!**/dist/**',
    '!**/web-build/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/e2e/**',
    '!**/jest.config.js',
    '!**/jest.setup.js',
    '!**/babel.config.js',
    '!**/metro.config.js',
  ],

  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Performance
  maxWorkers: '50%',

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
};
```

### Jest Setup File

**File**: `jest.setup.js`

```javascript
// Import React Native Testing Library matchers (toBeVisible, toHaveTextContent, etc.)
// Note: @testing-library/jest-native package is deprecated.
// In RNTL v13+, matchers are built-in and auto-extend when you import from the library.
// We keep this explicit import for clarity and backwards compatibility.
require('@testing-library/jest-native/extend-expect');

// Mock React Native modules that don't work in Jest
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock expo modules
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: () => ({ uri: 'mock-uri' }),
  },
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Silence console during tests (optional - comment out for debugging)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Keep warn and error for visibility
  warn: console.warn,
  error: console.error,
};

// Set up fake timers with modern implementation
// Note: For React 19, timer advances must be wrapped in act() to flush concurrent updates
// Example: act(() => jest.advanceTimersByTime(1000));
beforeEach(() => {
  jest.useFakeTimers('modern');
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
```

> **React 19 Timer Note**: When advancing timers in tests, always wrap timer advances
> in `act()` to ensure React's concurrent/Suspense updates flush correctly:
>
> ```javascript
> import { act } from '@testing-library/react-native';
> act(() => jest.advanceTimersByTime(1000));
> ```

### Directory Structure for Tests

```
BMA-2026/
├── __tests__/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   ├── Input.test.tsx
│   │   └── Card.test.tsx
│   ├── hooks/
│   │   ├── useBreakpoint.test.ts
│   │   └── usePlatform.test.ts
│   ├── utils/
│   │   └── colors.test.ts
│   └── contexts/
│       └── AuthContext.test.tsx
├── components/
├── hooks/
├── utils/
└── ...
```

### Example Unit Tests

**File**: `__tests__/components/Button.test.tsx`

```tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '@/components/Button';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Helper to wrap components with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Button', () => {
  describe('rendering', () => {
    it('renders with title', () => {
      renderWithProviders(<Button title="Click me" onPress={() => {}} />);
      expect(screen.getByText('Click me')).toBeTruthy();
    });

    it('renders with primary variant by default', () => {
      renderWithProviders(<Button title="Primary" onPress={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders loading state', () => {
      renderWithProviders(<Button title="Loading" onPress={() => {}} loading />);
      expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    it('renders disabled state', () => {
      renderWithProviders(<Button title="Disabled" onPress={() => {}} disabled />);
      const button = screen.getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('interactions', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      renderWithProviders(<Button title="Press me" onPress={onPress} />);

      fireEvent.press(screen.getByText('Press me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      renderWithProviders(<Button title="Disabled" onPress={onPress} disabled />);

      fireEvent.press(screen.getByText('Disabled'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const onPress = jest.fn();
      renderWithProviders(<Button title="Loading" onPress={onPress} loading />);

      fireEvent.press(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;

    variants.forEach((variant) => {
      it(`renders ${variant} variant`, () => {
        renderWithProviders(<Button title={variant} onPress={() => {}} variant={variant} />);
        expect(screen.getByText(variant)).toBeTruthy();
      });
    });
  });
});
```

**File**: `__tests__/hooks/useBreakpoint.test.ts`

```tsx
import { renderHook } from '@testing-library/react-native';
import { useBreakpoint } from '@/hooks/useBreakpoint';

// Mock useWindowDimensions
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useWindowDimensions: jest.fn(),
}));

import { useWindowDimensions } from 'react-native';

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

describe('useBreakpoint', () => {
  it('returns mobile breakpoint for small screens', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812 });

    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('returns tablet breakpoint for medium screens', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024 });

    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('returns desktop breakpoint for large screens', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 1440, height: 900 });

    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });
});
```

**File**: `__tests__/utils/colors.test.ts`

```typescript
import { withOpacity, hexToRgb, adjustBrightness } from '@/utils/colors';

describe('colors utility', () => {
  describe('withOpacity', () => {
    it('adds opacity to hex color', () => {
      const result = withOpacity('#FF0000', 0.5);
      expect(result).toMatch(/rgba\(255,\s*0,\s*0,\s*0\.5\)/);
    });

    it('handles full opacity', () => {
      const result = withOpacity('#00FF00', 1);
      expect(result).toMatch(/rgba\(0,\s*255,\s*0,\s*1\)/);
    });

    it('handles zero opacity', () => {
      const result = withOpacity('#0000FF', 0);
      expect(result).toMatch(/rgba\(0,\s*0,\s*255,\s*0\)/);
    });
  });

  describe('hexToRgb', () => {
    it('converts hex to RGB object', () => {
      const result = hexToRgb('#FF5500');
      expect(result).toEqual({ r: 255, g: 85, b: 0 });
    });

    it('handles lowercase hex', () => {
      const result = hexToRgb('#ff5500');
      expect(result).toEqual({ r: 255, g: 85, b: 0 });
    });
  });
});
```

---

## Phase 3: Integration Testing Framework

### MSW (Mock Service Worker) Setup

**File**: `__mocks__/msw/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';

const SUPABASE_URL = 'https://test.supabase.co';

export const handlers = [
  // Auth endpoints
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: { name: 'Test User' },
        },
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post(`${SUPABASE_URL}/auth/v1/signup`, async ({ request }) => {
    const body = (await request.json()) as { email?: string };

    return HttpResponse.json({
      user: {
        id: 'new-user-123',
        email: body.email,
      },
    });
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Profile endpoints
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    return HttpResponse.json([
      {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: null,
      },
    ]);
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/profiles`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),
];
```

**File**: `__mocks__/msw/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Integration Test Setup

**File**: `jest.integration.config.js`

```javascript
const baseConfig = require('./jest.config');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,

  // Only run integration tests
  testMatch: ['**/*.integration.test.[jt]s?(x)'],

  // Don't ignore integration tests
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/', '/web-build/', '/e2e/'],

  // Setup MSW server
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/jest.integration.setup.js'],

  // Longer timeout for integration tests
  testTimeout: 15000,
};
```

**File**: `jest.integration.setup.js`

```javascript
import { server } from './__mocks__/msw/server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

### Example Integration Tests

**File**: `__tests__/contexts/AuthContext.integration.test.tsx`

```tsx
import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { server } from '../../__mocks__/msw/server';
import { http, HttpResponse } from 'msw';

// Test component that uses auth context
const TestAuthComponent = () => {
  const { user, login, logout, loading, error } = useAuth();

  if (loading) return <Text testID="loading">Loading...</Text>;

  return (
    <>
      {error && <Text testID="error">{error}</Text>}
      {user ? (
        <>
          <Text testID="user-email">{user.email}</Text>
          <TouchableOpacity testID="logout-button" onPress={logout}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          testID="login-button"
          onPress={() => login('test@example.com', 'password123')}
        >
          <Text>Login</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

describe('AuthContext Integration', () => {
  it('handles successful login flow', async () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Click login button
    fireEvent.press(screen.getByTestId('login-button'));

    // Wait for user to be logged in
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('handles failed login', async () => {
    // Override handler for this test
    server.use(
      http.post('https://test.supabase.co/auth/v1/token', () => {
        return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      })
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeTruthy();
    });
  });

  it('handles logout flow', async () => {
    // Start with logged in user
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Login first
    fireEvent.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('logout-button')).toBeTruthy();
    });

    // Now logout
    fireEvent.press(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeTruthy();
    });
  });
});
```

**File**: `__tests__/screens/Login.integration.test.tsx`

```tsx
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import LoginScreen from '@/app/(auth)/login';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

const renderLoginScreen = () => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('Login Screen Integration', () => {
  it('shows validation errors for empty fields', async () => {
    renderLoginScreen();

    // Try to submit without filling fields
    fireEvent.press(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeTruthy();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderLoginScreen();

    fireEvent.changeText(screen.getByPlaceholderText(/email/i), 'invalid-email');
    fireEvent.changeText(screen.getByPlaceholderText(/password/i), 'password123');
    fireEvent.press(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeTruthy();
    });
  });

  it('submits form with valid credentials', async () => {
    renderLoginScreen();

    fireEvent.changeText(screen.getByPlaceholderText(/email/i), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText(/password/i), 'password123');
    fireEvent.press(screen.getByText('Sign In'));

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });
  });
});
```

---

## Phase 4: E2E Testing Framework

### Web E2E with Playwright

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/web',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Start local dev server before tests
  webServer: {
    command: 'npm run web',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**File**: `e2e/web/auth.e2e.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.getByText(/sign up/i).click();
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByText(/forgot password/i).click();
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // This test should use test credentials or mock auth
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // After successful login, should redirect to home
    await expect(page).toHaveURL(/.*home/);
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('wrong@example.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid/i)).toBeVisible();
  });
});
```

**File**: `e2e/web/navigation.e2e.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test (use helper or API)
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/.*home/);
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/.*profile/);
  });

  test('should logout and redirect to login', async ({ page }) => {
    await page.getByRole('link', { name: /profile/i }).click();
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});
```

### Mobile E2E with Maestro

**Directory Structure**:

```
e2e/
├── mobile/
│   ├── flows/
│   │   ├── auth.yaml
│   │   ├── navigation.yaml
│   │   └── profile.yaml
│   └── config.yaml
└── web/
    └── *.e2e.ts
```

**File**: `e2e/mobile/config.yaml`

```yaml
# Maestro configuration
appId: com.bma.app2026
name: BMA 2026 E2E Tests
```

**File**: `e2e/mobile/flows/auth.yaml`

```yaml
appId: com.bma.app2026
name: Authentication Flow
---
# Test: Login screen displays correctly
- assertVisible: 'Sign In'
- assertVisible:
    id: 'email-input'
- assertVisible:
    id: 'password-input'

---
# Test: Validation errors for empty form
- tapOn: 'Sign In'
- assertVisible: 'Email is required'

---
# Test: Login with valid credentials
- tapOn:
    id: 'email-input'
- inputText: 'test@example.com'
- tapOn:
    id: 'password-input'
- inputText: 'password123'
- tapOn: 'Sign In'
- assertVisible: 'Welcome'

---
# Test: Navigate to signup
- tapOn: 'Sign Up'
- assertVisible: 'Create Account'
```

**File**: `e2e/mobile/flows/navigation.yaml`

```yaml
appId: com.bma.app2026
name: Navigation Flow
---
# Prerequisites: Login first
- tapOn:
    id: 'email-input'
- inputText: 'test@example.com'
- tapOn:
    id: 'password-input'
- inputText: 'password123'
- tapOn: 'Sign In'
- assertVisible: 'Welcome'

---
# Test: Navigate to profile
- tapOn: 'Profile'
- assertVisible: 'Profile Settings'

---
# Test: Logout flow
- tapOn: 'Logout'
- assertVisible: 'Sign In'
```

**File**: `e2e/mobile/flows/smoke.yaml`

```yaml
appId: com.bma.app2026
name: Smoke Test
---
# Quick smoke test to verify app launches and basic functionality

# App launches successfully
- assertVisible: 'Sign In'

# Can interact with login form
- tapOn:
    id: 'email-input'
- inputText: 'smoke@test.com'
- assertVisible: 'smoke@test.com'

# Can clear and type again
- clearText
- inputText: 'test@example.com'

# Navigation elements are present
- assertVisible: 'Sign Up'
- assertVisible: 'Forgot Password'
```

### Running Maestro Tests

```bash
# Run all mobile E2E tests
maestro test e2e/mobile/flows/

# Run specific flow
maestro test e2e/mobile/flows/auth.yaml

# Run on specific device
maestro test --device emulator-5554 e2e/mobile/flows/

# Record test execution
maestro record e2e/mobile/flows/smoke.yaml
```

---

## Phase 5: CI/CD Integration

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js",
    "test:unit": "jest --testPathIgnorePatterns='integration'",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e:web": "playwright test",
    "test:e2e:web:ui": "playwright test --ui",
    "test:e2e:mobile": "maestro test e2e/mobile/flows/",
    "test:e2e:mobile:smoke": "maestro test e2e/mobile/flows/smoke.yaml"
  }
}
```

### GitHub Actions: PR Tests (Unit + Integration)

**File**: `.github/workflows/test-pr.yml`

```yaml
name: PR Tests

on:
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

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

      - name: Run unit tests
        run: npm run test:unit -- --ci --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          flags: unit
          fail_ci_if_error: false

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

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

      - name: Run integration tests
        run: npm run test:integration -- --ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          flags: integration
          fail_ci_if_error: false
```

### GitHub Actions: E2E on Main Push

**File**: `.github/workflows/e2e-main.yml`

```yaml
name: E2E Tests (Main)

on:
  push:
    branches: [main]

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: false

jobs:
  e2e-web:
    name: E2E Web Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

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

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e:web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### GitHub Actions: E2E on Release Tag

**File**: `.github/workflows/e2e-release.yml`

```yaml
name: E2E Tests (Release)

on:
  push:
    tags:
      - 'v*'

jobs:
  e2e-web:
    name: E2E Web Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

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

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests (all browsers)
        run: npx playwright test --project=chromium --project=firefox --project=webkit
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  e2e-mobile:
    name: E2E Mobile Tests
    runs-on: macos-latest
    timeout-minutes: 60

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

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Build development client
        run: eas build --profile development --platform ios --local --output ./build.app

      - name: Start iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15"
          xcrun simctl install booted ./build.app

      - name: Run Maestro tests
        run: maestro test e2e/mobile/flows/

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: maestro-results
          path: ~/.maestro/tests/
          retention-days: 30
```

---

## Phase 6: Coverage Reporting & Quality Gates

### Codecov Configuration

**File**: `codecov.yml`

```yaml
codecov:
  require_ci_to_pass: yes

coverage:
  precision: 2
  round: down
  range: '60...90'

  status:
    project:
      default:
        target: 60%
        threshold: 5%
    patch:
      default:
        target: 70%
        threshold: 5%

parsers:
  gcov:
    branch_detection:
      conditional: yes
      loop: yes
      method: no
      macro: no

comment:
  layout: 'reach,diff,flags,tree,betaprofiling'
  behavior: default
  require_changes: no
  require_base: no
  require_head: yes
```

### Coverage Thresholds

| Metric     | Minimum | Target | Notes                      |
| ---------- | ------- | ------ | -------------------------- |
| Lines      | 60%     | 80%    | Overall line coverage      |
| Branches   | 60%     | 75%    | Conditional logic coverage |
| Functions  | 60%     | 80%    | Function coverage          |
| Statements | 60%     | 80%    | Statement coverage         |

### Quality Gates (PR Requirements)

| Check                        | Required | Notes                           |
| ---------------------------- | -------- | ------------------------------- |
| Unit tests pass              | ✅       | All unit tests must pass        |
| Integration tests pass       | ✅       | All integration tests must pass |
| Coverage > 60%               | ✅       | Minimum coverage threshold      |
| No decrease in coverage > 5% | ⚠️       | Warning if coverage drops       |
| TypeScript check passes      | ✅       | No type errors                  |
| ESLint passes                | ✅       | No linting errors               |
| Prettier check passes        | ✅       | Consistent formatting           |

---

## File Structure After Implementation

```
BMA-2026/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint & Type Check
│       ├── test-pr.yml               # Unit + Integration tests (PR)
│       ├── e2e-main.yml              # E2E web tests (main push)
│       ├── e2e-release.yml           # E2E all platforms (tag push)
│       └── eas-build.yml             # EAS builds
├── __tests__/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   ├── Input.test.tsx
│   │   └── Card.test.tsx
│   ├── hooks/
│   │   ├── useBreakpoint.test.ts
│   │   └── usePlatform.test.ts
│   ├── utils/
│   │   └── colors.test.ts
│   ├── contexts/
│   │   ├── AuthContext.test.tsx
│   │   └── AuthContext.integration.test.tsx
│   └── screens/
│       └── Login.integration.test.tsx
├── __mocks__/
│   └── msw/
│       ├── handlers.ts
│       └── server.ts
├── e2e/
│   ├── web/
│   │   ├── auth.e2e.ts
│   │   └── navigation.e2e.ts
│   └── mobile/
│       ├── config.yaml
│       └── flows/
│           ├── auth.yaml
│           ├── navigation.yaml
│           └── smoke.yaml
├── jest.config.js
├── jest.setup.js
├── jest.integration.config.js
├── jest.integration.setup.js
├── playwright.config.ts
├── codecov.yml
└── package.json
```

---

## Implementation Checklist

### Phase 1: Infrastructure Setup

- [ ] Install Jest and related dependencies
- [ ] Install Playwright
- [ ] Install Maestro CLI (local development)
- [ ] Create jest.config.js
- [ ] Create jest.setup.js
- [ ] Create playwright.config.ts

### Phase 2: Unit Testing

- [ ] Create `__tests__/` directory structure
- [ ] Write component tests (Button, Input, Card)
- [ ] Write hook tests (useBreakpoint, usePlatform)
- [ ] Write utility tests (colors)
- [ ] Achieve >60% unit test coverage

### Phase 3: Integration Testing

- [ ] Set up MSW handlers
- [ ] Create jest.integration.config.js
- [ ] Write AuthContext integration tests
- [ ] Write Login screen integration tests
- [ ] Test API error handling scenarios

### Phase 4: E2E Testing

- [ ] Create e2e/web/ directory with Playwright tests
- [ ] Create e2e/mobile/ directory with Maestro flows
- [ ] Write auth flow tests (web)
- [ ] Write auth flow tests (mobile)
- [ ] Write smoke tests

### Phase 5: CI/CD Integration

- [ ] Create .github/workflows/test-pr.yml
- [ ] Create .github/workflows/e2e-main.yml
- [ ] Create .github/workflows/e2e-release.yml
- [ ] Add test scripts to package.json
- [ ] Configure branch protection rules

### Phase 6: Coverage & Quality

- [ ] Set up Codecov account
- [ ] Create codecov.yml
- [ ] Configure coverage thresholds
- [ ] Add Codecov badge to README

---

## Troubleshooting

### Common Issues

#### Issue: Jest can't find module `@/...`

**Solution**: Ensure `moduleNameMapper` in jest.config.js matches tsconfig paths:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
},
```

#### Issue: MSW not intercepting requests

**Solution**: Ensure MSW server is started before tests and using correct URL patterns:

```javascript
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
```

#### Issue: Playwright timeout on CI

**Solution**: Increase timeout and ensure web server is ready:

```typescript
webServer: {
  command: 'npm run web',
  url: 'http://localhost:8081',
  timeout: 120000,
},
```

#### Issue: Maestro can't find element

**Solution**: Add `testID` props to React Native components:

```tsx
<TextInput testID="email-input" ... />
```

#### Issue: Tests fail with "Cannot find module 'react-native'"

**Solution**: Ensure transformIgnorePatterns includes all necessary packages:

```javascript
transformIgnorePatterns: [
  'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|...)',
],
```

---

## Related Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Maestro Documentation](https://maestro.mobile.dev/docs)
- [Codecov Documentation](https://docs.codecov.com/)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
