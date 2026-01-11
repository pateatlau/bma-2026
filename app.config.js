/**
 * Expo Configuration
 *
 * Dynamic configuration that extends app.json with environment-specific settings.
 * @see https://docs.expo.dev/versions/latest/config/app/
 */

const IS_DEV = process.env.EXPO_PUBLIC_ENV === 'development';
const IS_PREVIEW = process.env.EXPO_PUBLIC_ENV === 'preview';
const IS_PROD = process.env.EXPO_PUBLIC_ENV === 'production';

// Sentry configuration with validation
const SENTRY_PLACEHOLDERS = ['your-org', 'bma-2026'];
const getSentryConfig = () => {
  const org = process.env.SENTRY_ORG || 'your-org';
  const project = process.env.SENTRY_PROJECT || 'bma-2026';

  // Warn in production/preview if Sentry config is missing or using placeholders
  if (IS_PROD || IS_PREVIEW) {
    const warnings = [];
    if (!process.env.SENTRY_ORG || SENTRY_PLACEHOLDERS.includes(org)) {
      warnings.push('SENTRY_ORG is missing or using placeholder value');
    }
    if (!process.env.SENTRY_PROJECT || SENTRY_PLACEHOLDERS.includes(project)) {
      warnings.push('SENTRY_PROJECT is missing or using placeholder value');
    }
    if (warnings.length > 0) {
      console.warn(
        `\n⚠️  Sentry Configuration Warning:\n   ${warnings.join('\n   ')}\n   Source map uploads may fail. Set these environment variables for error tracking.\n`
      );
    }
  }

  return { organization: org, project };
};

// Get app name based on environment
const getAppName = () => {
  if (IS_DEV) return 'BMA 2026 (Dev)';
  if (IS_PREVIEW) return 'BMA 2026 (Preview)';
  return 'BMA 2026';
};

// Get bundle identifier suffix for different environments
const getBundleIdSuffix = () => {
  if (IS_DEV) return '.dev';
  if (IS_PREVIEW) return '.preview';
  return '';
};

module.exports = ({ config }) => {
  const bundleIdSuffix = getBundleIdSuffix();

  return {
    ...config,
    name: getAppName(),
    // Sentry plugin for source maps and native crash reporting
    plugins: [...(config.plugins || []), ['@sentry/react-native', getSentryConfig()]],
    ios: {
      ...config.ios,
      bundleIdentifier: `com.bma.app2026${bundleIdSuffix}`,
    },
    android: {
      ...config.android,
      package: `com.bma.app2026${bundleIdSuffix}`,
    },
    extra: {
      ...config.extra,
      // Environment information
      env: process.env.EXPO_PUBLIC_ENV || 'development',
      isDev: IS_DEV,
      isPreview: IS_PREVIEW,
      isProd: IS_PROD,

      // Supabase configuration (from environment variables)
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,

      // EAS configuration
      eas: {
        projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id',
      },
    },
    // EAS updates configuration
    updates: {
      url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID || 'your-eas-project-id'}`,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  };
};
