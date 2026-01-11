/**
 * Sentry Error Tracking & Performance Monitoring
 *
 * Provides cross-platform error tracking for Web, iOS, and Android.
 * Free tier includes 5,000 errors/month.
 *
 * @see https://docs.sentry.io/platforms/react-native/
 */

import Constants from 'expo-constants';

// Lazy-load Sentry to avoid crash in Expo Go on Android
// where native modules are not available
let Sentry: typeof import('@sentry/react-native') | null = null;
let sentryInitialized = false;

// Check if we're in development mode
const isDev = __DEV__;

// Get environment from Expo config
const environment = Constants.expoConfig?.extra?.env || 'development';

/**
 * Safely get Sentry module, loading it lazily if not already loaded
 */
function getSentry(): typeof import('@sentry/react-native') | null {
  if (Sentry === null) {
    try {
      // Dynamic import to catch any native module errors
      Sentry = require('@sentry/react-native');
    } catch (error) {
      if (isDev) {
        console.warn('Failed to load @sentry/react-native (expected in Expo Go):', error);
      }
      return null;
    }
  }
  return Sentry;
}

/**
 * Initialize Sentry SDK
 *
 * Call this function at app startup, before any other code runs.
 * Should be called in app/_layout.tsx.
 */
export function initSentry(): void {
  // Skip initialization if DSN is not configured
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    if (!isDev) {
      console.warn('Sentry DSN not configured. Error tracking disabled.');
    }
    return;
  }

  const sentry = getSentry();
  if (!sentry) {
    return;
  }

  try {
    sentry.init({
      dsn,
      environment,

      // Disable in development to avoid noise
      enabled: !isDev,

      // Enable debug mode in development for troubleshooting
      debug: isDev,

      // Sample rate for error events (1.0 = 100%)
      sampleRate: 1.0,

      // Sample rate for performance transactions
      // Lower this in production if you hit quota limits
      tracesSampleRate: isDev ? 1.0 : 0.2,

      // Attach stack traces to all messages
      attachStacktrace: true,

      // Automatically capture unhandled promise rejections
      enableAutoSessionTracking: true,

      // Session tracking interval (default: 30 seconds)
      sessionTrackingIntervalMillis: 30000,

      // Configure which errors to ignore
      beforeSend(event) {
        // Filter out development-only errors
        if (isDev) {
          return null;
        }

        return event;
      },

      // Set initial scope with app context
      initialScope: {
        tags: {
          'app.environment': environment,
          'app.version': Constants.expoConfig?.version || 'unknown',
          'expo.sdk': Constants.expoConfig?.sdkVersion || 'unknown',
        },
      },
    });
    sentryInitialized = true;
  } catch (error) {
    // Sentry initialization may fail in Expo Go (development client)
    // where native modules are not available. This is expected behavior.
    if (isDev) {
      console.warn('Sentry initialization failed (expected in Expo Go):', error);
    }
  }
}

/**
 * Capture a custom error with additional context
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  const sentry = getSentry();
  if (!sentry || !sentryInitialized) return;

  try {
    if (context) {
      sentry.withScope((scope) => {
        scope.setExtras(context);
        sentry.captureException(error);
      });
    } else {
      sentry.captureException(error);
    }
  } catch {
    // Silently fail if Sentry is not available
  }
}

/**
 * Capture a custom message
 */
export function captureMessage(
  message: string,
  level: import('@sentry/react-native').SeverityLevel = 'info'
): void {
  const sentry = getSentry();
  if (!sentry || !sentryInitialized) return;

  try {
    sentry.captureMessage(message, level);
  } catch {
    // Silently fail if Sentry is not available
  }
}

/**
 * Set user context for error tracking
 * Call this after user authentication
 */
export function setUser(user: { id: string; email?: string } | null): void {
  const sentry = getSentry();
  if (!sentry || !sentryInitialized) return;

  try {
    if (user) {
      sentry.setUser({
        id: user.id,
        email: user.email,
      });
    } else {
      sentry.setUser(null);
    }
  } catch {
    // Silently fail if Sentry is not available
  }
}

/**
 * Add breadcrumb for debugging
 * Breadcrumbs help trace the sequence of events leading to an error
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: import('@sentry/react-native').SeverityLevel = 'info'
): void {
  const sentry = getSentry();
  if (!sentry || !sentryInitialized) return;

  try {
    sentry.addBreadcrumb({
      category,
      message,
      level,
    });
  } catch {
    // Silently fail if Sentry is not available
  }
}

/**
 * Start a performance transaction
 * Use for tracking custom operations like API calls
 */
export function startTransaction(
  name: string,
  op: string
): import('@sentry/react-native').Span | undefined {
  const sentry = getSentry();
  if (!sentry || !sentryInitialized) return undefined;

  try {
    return sentry.startInactiveSpan({ name, op });
  } catch {
    return undefined;
  }
}
