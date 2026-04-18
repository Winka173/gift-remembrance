import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AD_UNIT_IDS } from '@/constants/config';

// Wrap the native ads import so a missing native module doesn't crash the JS bundle.
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = { ADAPTIVE_BANNER: '' };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('react-native-google-mobile-ads');
  BannerAd = mod.BannerAd;
  BannerAdSize = mod.BannerAdSize;
  TestIds = mod.TestIds;
} catch {
  BannerAd = null;
}

interface BannerAdSlotProps {
  unitId?: string;
}

export function BannerAdSlot({ unitId }: BannerAdSlotProps) {
  const insets = useSafeAreaInsets();
  const [failedToLoad, setFailedToLoad] = useState(false);

  if (!BannerAd) {
    return null;
  }

  const productionId =
    Platform.OS === 'ios'
      ? AD_UNIT_IDS.ios.banner
      : AD_UNIT_IDS.android.banner;

  const resolvedUnitId = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : unitId ?? productionId;

  return (
    <View
      style={{
        paddingBottom: failedToLoad ? 0 : insets.bottom,
        height: failedToLoad ? 0 : undefined,
        overflow: 'hidden',
      }}
    >
      <BannerAd
        unitId={resolvedUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailedToLoad(true)}
        onAdLoaded={() => setFailedToLoad(false)}
      />
    </View>
  );
}
