import React from 'react';
import { Platform } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.OS === 'ios'
  ? 'ca-app-pub-9242538862106063/5206329603'
  : 'ca-app-pub-9242538862106063/3346005912';

const ScreenBannerAd = () => {
  return (
    <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
  );
};

export default ScreenBannerAd;
