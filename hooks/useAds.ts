import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { recordAddEvent, pruneAddEvents, setLastInterstitialAt } from '@/store/slices/adsSlice';
import { RATE_LIMIT } from '@/constants/config';

export function useAds() {
  const dispatch = useAppDispatch();
  const { addEvents, lastInterstitialAt, interstitialReady } = useAppSelector((s) => s.ads);

  const shouldShowInterstitial = useCallback(() => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.WINDOW_MS;
    dispatch(pruneAddEvents(windowStart));
    const recentCount = addEvents.filter((t) => t >= windowStart).length;
    const cooledDown = now - lastInterstitialAt >= RATE_LIMIT.INTERSTITIAL_COOLDOWN_MS;
    return interstitialReady && recentCount >= RATE_LIMIT.THRESHOLD && cooledDown;
  }, [dispatch, addEvents, lastInterstitialAt, interstitialReady]);

  const recordEvent = useCallback(() => {
    dispatch(recordAddEvent(Date.now()));
  }, [dispatch]);

  const markShown = useCallback(() => {
    dispatch(setLastInterstitialAt(Date.now()));
  }, [dispatch]);

  return { shouldShowInterstitial, recordEvent, markShown };
}
