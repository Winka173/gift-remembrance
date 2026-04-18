import {
  pruneOldEvents,
  recordAddEvent,
  shouldShowInterstitial,
} from '@/utils/rateLimiter';
import type { AdsState } from '@/types/ads';
import { RATE_LIMIT } from '@/constants/config';

function makeState(overrides: Partial<AdsState> = {}): AdsState {
  return {
    bannerReady: false,
    interstitialReady: false,
    addEvents: [],
    lastInterstitialAt: 0,
    consentStatus: 'unknown',
    ...overrides,
  };
}

describe('pruneOldEvents', () => {
  it('drops events older than the rate-limit window', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-15T12:00:00Z'));
    const now = Date.now();
    const tooOld = now - RATE_LIMIT.WINDOW_MS - 1;
    const fresh = now - 1000;
    const pruned = pruneOldEvents([tooOld, fresh]);
    expect(pruned).toEqual([fresh]);
    jest.useRealTimers();
  });

  it('keeps events exactly at the window boundary', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-15T12:00:00Z'));
    const now = Date.now();
    const cutoff = now - RATE_LIMIT.WINDOW_MS;
    expect(pruneOldEvents([cutoff])).toEqual([cutoff]);
    jest.useRealTimers();
  });
});

describe('recordAddEvent', () => {
  it('appends the current timestamp to pruned events', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-15T12:00:00Z'));
    const now = Date.now();
    const stale = now - RATE_LIMIT.WINDOW_MS - 100;
    const state = makeState({ addEvents: [stale] });
    const next = recordAddEvent(state);
    expect(next.addEvents).not.toContain(stale);
    expect(next.addEvents[next.addEvents.length - 1]).toBe(now);
    jest.useRealTimers();
  });
});

describe('shouldShowInterstitial', () => {
  it('returns false when fewer than threshold add events have occurred', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-15T12:00:00Z'));
    const now = Date.now();
    const state = makeState({ addEvents: [now, now, now], lastInterstitialAt: 0 });
    expect(shouldShowInterstitial(state)).toBe(false);
    jest.useRealTimers();
  });

  it('returns true when threshold reached and cooldown elapsed', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-15T12:00:00Z'));
    const now = Date.now();
    const events = Array(RATE_LIMIT.THRESHOLD).fill(now - 1000);
    const state = makeState({
      addEvents: events,
      lastInterstitialAt: now - RATE_LIMIT.INTERSTITIAL_COOLDOWN_MS - 1,
    });
    expect(shouldShowInterstitial(state)).toBe(true);
    jest.useRealTimers();
  });

  it('returns false when still within interstitial cooldown', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-15T12:00:00Z'));
    const now = Date.now();
    const events = Array(RATE_LIMIT.THRESHOLD).fill(now - 1000);
    const state = makeState({
      addEvents: events,
      lastInterstitialAt: now - 1000,
    });
    expect(shouldShowInterstitial(state)).toBe(false);
    jest.useRealTimers();
  });
});
