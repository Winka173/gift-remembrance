export type ConsentStatus = 'unknown' | 'required' | 'obtained' | 'not_required';

export interface AdsState {
  bannerReady: boolean;
  interstitialReady: boolean;
  addEvents: number[];
  lastInterstitialAt: number;
  consentStatus: ConsentStatus;
}
