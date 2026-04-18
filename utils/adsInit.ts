import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';
import mobileAds, {
  AdsConsent,
  AdsConsentStatus,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

export async function initializeAds(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
      if (status === 'undetermined') {
        await TrackingTransparency.requestTrackingPermissionsAsync();
      }
    }

    const consentInfo = await AdsConsent.requestInfoUpdate();
    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdsConsentStatus.REQUIRED
    ) {
      await AdsConsent.showForm().catch(() => {});
    }

    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });

    await mobileAds().initialize();
  } catch (e) {
    console.warn('[adsInit] Failed to initialize ads:', e);
  }
}

export async function resetAdsConsent(): Promise<void> {
  try {
    await AdsConsent.reset();
    const consentInfo = await AdsConsent.requestInfoUpdate();
    if (consentInfo.isConsentFormAvailable) {
      await AdsConsent.showForm().catch(() => {});
    }
  } catch (e) {
    console.warn('[adsInit] Failed to reset consent:', e);
  }
}
