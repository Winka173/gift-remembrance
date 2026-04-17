import type { AdsState } from '@/types/ads';
import { RATE_LIMIT } from '@/constants/config';

export function pruneOldEvents(events: number[]): number[] {
  const cutoff = Date.now() - RATE_LIMIT.WINDOW_MS;
  return events.filter((t) => t >= cutoff);
}

export function recordAddEvent(state: AdsState): AdsState {
  const pruned = pruneOldEvents(state.addEvents);
  return { ...state, addEvents: [...pruned, Date.now()] };
}

export function shouldShowInterstitial(state: AdsState): boolean {
  const pruned = pruneOldEvents(state.addEvents);
  if (pruned.length < RATE_LIMIT.THRESHOLD) return false;
  if (Date.now() - state.lastInterstitialAt < RATE_LIMIT.INTERSTITIAL_COOLDOWN_MS) return false;
  return true;
}
