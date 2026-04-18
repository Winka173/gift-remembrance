import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

export function initSentry(): void {
  const dsn = (Constants.expoConfig?.extra as Record<string, string> | undefined)?.sentryDsn;
  if (!dsn) return;
  try {
    Sentry.init({
      dsn,
      enableNative: true,
      enableAutoSessionTracking: true,
      debug: __DEV__,
      tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    });
  } catch (e) {
    console.warn('[errorTracking] Sentry init failed:', e);
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  try {
    Sentry.captureException(error, { extra: context });
  } catch {
    /* noop */
  }
}

export function captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void {
  try {
    Sentry.captureMessage(message, level);
  } catch {
    /* noop */
  }
}
