/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them to Sentry, and displays a fallback UI.
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import React, { Component, ReactNode } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { captureError, addBreadcrumb } from '@/lib/sentry';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/Button';
import { lightSemanticColors } from '@/constants/tokens';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log breadcrumb for debugging
    addBreadcrumb('error-boundary', `Component stack: ${errorInfo.componentStack}`);

    // Capture error in Sentry with component stack
    captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Heading level="h2" style={styles.title}>
              Something went wrong
            </Heading>
            <Text style={styles.message}>
              We apologize for the inconvenience. The error has been reported and we&apos;re working
              to fix it.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
              </View>
            )}
            <Button
              title="Try Again"
              onPress={this.handleRetry}
              variant="primary"
              style={styles.button}
            />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Minimal error fallback for use in critical paths
 * Shows a simple message without any complex components
 */
export function MinimalErrorFallback({ onRetry }: { onRetry?: () => void }): React.ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.minimalTitle}>Something went wrong</Text>
        <Text style={styles.minimalMessage}>Please try again or restart the app.</Text>
        {onRetry && (
          <Pressable style={styles.minimalButton} onPress={onRetry}>
            <Text style={styles.minimalButtonText}>Try Again</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightSemanticColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    color: lightSemanticColors.text,
  },
  message: {
    textAlign: 'center',
    color: lightSemanticColors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: lightSemanticColors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: lightSemanticColors.error,
  },
  button: {
    minWidth: 150,
  },
  // Minimal fallback styles
  minimalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: lightSemanticColors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  minimalMessage: {
    fontSize: 16,
    color: lightSemanticColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  minimalButton: {
    backgroundColor: lightSemanticColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  minimalButtonText: {
    color: lightSemanticColors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
