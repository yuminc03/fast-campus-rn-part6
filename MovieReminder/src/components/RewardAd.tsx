import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import {
  AdEventType,
  RewardedAdEventType,
  RewardedInterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import Colors from 'open-color';

const adUnitId = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : Platform.OS === 'ios'
  ? 'ca-app-pub-9242538862106063/7904645131'
  : 'ca-app-pub-9242538862106063/1290688216';

interface RewardAdShowParam {
  onRewarded?: (rewarded: boolean) => void;
}

export interface RewardAdRef {
  show: (param: RewardAdShowParam) => void;
}

const RewardAd = React.forwardRef<RewardAdRef>((props, ref) => {
  const rewardedAdRef = useRef(
    RewardedInterstitialAd.createForAdRequest(adUnitId),
  );
  const [loaded, setLoaded] = useState(false);
  const onRewardedRef = useRef<RewardAdShowParam['onRewarded']>();
  const [visible, setVisible] = useState(false);
  const rewardRef = useRef(false);

  useEffect(() => {
    const unsubscribeLoaded = rewardedAdRef.current.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoaded(true);
        console.log('loaded');
      },
    );

    const unsubscribeEarned = rewardedAdRef.current.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewardRef.current = true;
      },
    );

    const unsubscribeClosed = rewardedAdRef.current.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        if (onRewardedRef.current != null) {
          onRewardedRef.current(rewardRef.current);
        }
        rewardRef.current = false;
        setVisible(false);
        setLoaded(false);
      },
    );

    if (!loaded) {
      rewardedAdRef.current.load();
    }

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, [loaded]);

  useEffect(() => {
    if (visible && loaded) {
      rewardedAdRef.current.show();
    }
  }, [loaded, visible]);

  useImperativeHandle(ref, () => ({
    show: ({ onRewarded }) => {
      onRewardedRef.current = onRewarded;
      setVisible(true);
    },
  }));

  if (visible && !loaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return null;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    backgroundColor: Colors.black,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RewardAd;
