import React from 'react';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

import SubscriptionContext from './SubscriptionContext';

const REVENUECAT_API_KEY = Platform.OS === 'ios' ? '' : '';

const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // purchases를 초기화하는 로직
    (async () => {
      await Purchases.setDebugLogsEnabled(__DEV__);
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      // 초기화 완료됨
      setInitialized(true);
    })();
  }, []);

  useEffect(() => {
    if (initialized) {
      // 구독 상태가 실시간으로 바뀐경우 자동으로 callback이 호출됨
      Purchases.addCustomerInfoUpdateListener(customerInfo => {
        setSubscribed(customerInfo.entitlements.active.Premium != null);
      });
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      (async () => {
        // 사용자 구독 상태를 얻어옴
        const customerInfo = await Purchases.getCustomerInfo();
        // customerInfo.entitlements.active.Premium이 null이 아니면 구독중
        setSubscribed(customerInfo.entitlements.active.Premium != null);
      })();
    }
  }, [initialized]);

  return (
    <SubscriptionContext.Provider value={{ subscribed }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;
