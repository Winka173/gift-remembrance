import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AdsState, ConsentStatus } from '@/types/ads';
import { saveSlice, loadSlice } from '@/utils/storage';

const fallback: AdsState = {
  bannerReady: false,
  interstitialReady: false,
  addEvents: [],
  lastInterstitialAt: 0,
  consentStatus: 'unknown',
};

const initialState: AdsState = loadSlice<AdsState>('ads', fallback);

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setBannerReady(state, action: PayloadAction<boolean>) {
      state.bannerReady = action.payload;
      saveSlice('ads', state);
    },
    setInterstitialReady(state, action: PayloadAction<boolean>) {
      state.interstitialReady = action.payload;
      saveSlice('ads', state);
    },
    recordAddEvent(state, action: PayloadAction<number>) {
      state.addEvents.push(action.payload);
      saveSlice('ads', state);
    },
    setLastInterstitialAt(state, action: PayloadAction<number>) {
      state.lastInterstitialAt = action.payload;
      saveSlice('ads', state);
    },
    setConsentStatus(state, action: PayloadAction<ConsentStatus>) {
      state.consentStatus = action.payload;
      saveSlice('ads', state);
    },
    pruneAddEvents(state, action: PayloadAction<number>) {
      const windowStart = action.payload;
      state.addEvents = state.addEvents.filter((t) => t >= windowStart);
      saveSlice('ads', state);
    },
  },
});

export const {
  setBannerReady,
  setInterstitialReady,
  recordAddEvent,
  setLastInterstitialAt,
  setConsentStatus,
  pruneAddEvents,
} = adsSlice.actions;
export default adsSlice.reducer;
