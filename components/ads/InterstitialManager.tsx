import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { AD_UNIT_IDS } from '@/constants/config';

// Safely import the native module; fall back to no-op if unavailable.
let InterstitialAd: any = null;
let AdEventType: any = {
  LOADED: 'loaded',
  CLOSED: 'closed',
  ERROR: 'error',
};
let TestIds: any = { INTERSTITIAL: '' };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('react-native-google-mobile-ads');
  InterstitialAd = mod.InterstitialAd;
  AdEventType = mod.AdEventType;
  TestIds = mod.TestIds;
} catch {
  InterstitialAd = null;
}

interface InterstitialContextValue {
  show: () => Promise<void>;
}

export const InterstitialContext = createContext<InterstitialContextValue>({
  show: async () => {},
});

export function useInterstitial(): InterstitialContextValue {
  return useContext(InterstitialContext);
}

interface InterstitialProviderProps {
  children?: React.ReactNode;
}

function resolveUnitId(): string {
  if (__DEV__) return TestIds.INTERSTITIAL;
  return Platform.OS === 'ios'
    ? AD_UNIT_IDS.ios.interstitial
    : AD_UNIT_IDS.android.interstitial;
}

export function InterstitialManager({ children }: InterstitialProviderProps) {
  const adRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const closeResolversRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!InterstitialAd) return;

    const unitId = resolveUnitId();
    if (!unitId) return;

    const ad = InterstitialAd.createForAdRequest(unitId);
    adRef.current = ad;

    const offLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      setReady(true);
    });
    const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setReady(false);
      const resolvers = closeResolversRef.current;
      closeResolversRef.current = [];
      resolvers.forEach((r) => r());
      try {
        ad.load();
      } catch {
        // ignore reload failure
      }
    });
    const offError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setReady(false);
    });

    try {
      ad.load();
    } catch {
      // ignore initial load failure
    }

    return () => {
      try {
        offLoaded?.();
        offClosed?.();
        offError?.();
      } catch {
        // ignore listener teardown failures
      }
      adRef.current = null;
    };
  }, []);

  const show = useCallback(async () => {
    const ad = adRef.current;
    if (!ad || !ready) return;
    await new Promise<void>((resolve) => {
      closeResolversRef.current.push(resolve);
      try {
        ad.show();
      } catch {
        const resolvers = closeResolversRef.current;
        closeResolversRef.current = [];
        resolvers.forEach((r) => r());
      }
    });
  }, [ready]);

  const value = useMemo<InterstitialContextValue>(() => ({ show }), [show]);

  return (
    <InterstitialContext.Provider value={value}>
      {children}
    </InterstitialContext.Provider>
  );
}

export function InterstitialProvider({ children }: InterstitialProviderProps) {
  return <InterstitialManager>{children}</InterstitialManager>;
}
