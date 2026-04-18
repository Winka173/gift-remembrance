import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export function useBiometricLock() {
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(false);

  const isAvailable = useCallback(async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  }, []);

  const authenticate = useCallback(
    async (reason = 'Unlock Gift Remembrance'): Promise<boolean> => {
      setChecking(true);
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: reason,
          disableDeviceFallback: false,
        });
        if (result.success) {
          setLocked(false);
          return true;
        }
        return false;
      } finally {
        setChecking(false);
      }
    },
    [],
  );

  return { locked, setLocked, checking, isAvailable, authenticate };
}
