/**
 * Sentry Error Tracking & Performance Monitoring
 *
 * Provides cross-platform error tracking for Web, iOS, and Android.
 * Free tier includes 5,000 errors/month.
 *
 * @see https://docs.sentry.io/platforms/react-native/
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Check if we're in development mode
const isDev = __DEV__;

// Get environment from Expo config
const environment = Constants.expoConfig?.extra?.env || 'development';

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

  Sentry.init({
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

      // You can filter or modify events here
      // Example: Remove sensitive data
      // if (event.user) {
      //   delete event.user.email;
      // }

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
}

/**
 * Capture a custom error with additional context
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a custom message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 * Call this after user authentication
 */
export function setUser(user: { id: string; email?: string } | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 * Breadcrumbs help trace the sequence of events leading to an error
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: Sentry.SeverityLevel = 'info'
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
  });
}

/**
 * Start a performance transaction
 * Use for tracking custom operations like API calls
 */
export function startTransaction(name: string, op: string): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({ name, op });
}

// Re-export Sentry for advanced usage
export { Sentry };
