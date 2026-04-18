import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Provider } from 'react-redux';
import { store } from '@/store';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { runMigrationsIfNeeded } from '@/utils/migrations';
import { runReconciliation } from '@/utils/reconcile';
import { initializeAds } from '@/utils/adsInit';
import { registerNotificationTapHandler } from '@/utils/notificationBoot';
import { rescheduleAllOccasionsThunk } from '@/store/thunks/rescheduleAllOccasionsThunk';
import { autoBackupThunk } from '@/store/thunks/autoBackupThunk';
import { useBiometricLock } from '@/hooks/useBiometricLock';
import { BiometricLockScreen } from '@/components/ui/BiometricLockScreen';
import { initSentry } from '@/utils/errorTracking';

SplashScreen.preventAutoHideAsync();

initSentry();

runMigrationsIfNeeded();

const RESCHEDULE_THROTTLE_MS = 24 * 60 * 60 * 1000;

export default function RootLayout() {
  const router = useRouter();
  const lastRescheduleRef = useRef<number>(0);
  const prevAppStateRef = useRef<string>(AppState.currentState);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const { authenticate } = useBiometricLock();

  const handleUnlock = useCallback(async () => {
    const ok = await authenticate();
    if (ok) setNeedsUnlock(false);
    return ok;
  }, [authenticate]);

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (store.getState().settings.biometricLockOnLaunch) {
      setNeedsUnlock(true);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await runReconciliation(store.getState(), store.dispatch);
      } catch (e) {
        console.warn('[boot] reconciliation failed:', e);
      }
      if (cancelled) return;

      lastRescheduleRef.current = Date.now();
      store.dispatch(rescheduleAllOccasionsThunk());
      store.dispatch(autoBackupThunk());
      void initializeAds();
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = registerNotificationTapHandler(router);
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = prevAppStateRef.current;
      prevAppStateRef.current = nextState;
      if (nextState !== 'active') return;
      if (
        (prev === 'background' || prev === 'inactive') &&
        store.getState().settings.biometricLockOnLaunch
      ) {
        setNeedsUnlock(true);
      }
      const now = Date.now();
      if (now - lastRescheduleRef.current < RESCHEDULE_THROTTLE_MS) return;
      lastRescheduleRef.current = now;
      store.dispatch(rescheduleAllOccasionsThunk());
      store.dispatch(autoBackupThunk());
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <Provider store={store}>
            <ToastProvider>
              {needsUnlock ? (
                <BiometricLockScreen onUnlock={handleUnlock} />
              ) : (
                <Stack screenOptions={{ headerShown: false }} />
              )}
            </ToastProvider>
          </Provider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
