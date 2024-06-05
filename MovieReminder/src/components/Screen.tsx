import React, { useCallback, useContext } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from 'open-color';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import ScreenBannerAd from './ScreenBannerAd';
import SubscriptionContext from './SubscriptionContext';

interface ScreenProps {
  title?: string;
  children?: React.ReactNode;
  headerVisible?: boolean;
  renderLeftComponent?: () => JSX.Element;
  renderRightComponent?: () => JSX.Element;
}

const Screen = ({
  children,
  title,
  headerVisible = true,
  renderLeftComponent,
  renderRightComponent,
}: ScreenProps) => {
  const colorScheme = useColorScheme();
  const { goBack, canGoBack, navigate } =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onPressBackButton = useCallback(() => {
    goBack();
  }, [goBack]);

  const { subscribed } = useContext(SubscriptionContext);

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'ios' ? (
        <StatusBar barStyle="light-content" />
      ) : colorScheme === 'dark' ? (
        <StatusBar barStyle="light-content" />
      ) : (
        <StatusBar barStyle="dark-content" />
      )}
      {headerVisible && (
        <View style={styles.header}>
          <View style={styles.left}>
            {canGoBack() && (
              <TouchableOpacity onPress={onPressBackButton}>
                <Icon style={styles.backIcon} name="arrow-back" />
              </TouchableOpacity>
            )}
            {renderLeftComponent != null && renderLeftComponent()}
          </View>
          <View style={styles.center}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <View style={styles.right}>
            {renderRightComponent != null && renderRightComponent()}
          </View>
        </View>
      )}
      {!subscribed && (
        <>
          <TouchableOpacity
            style={styles.subscription}
            onPress={() => {
              navigate('Purchase');
            }}>
            <Text style={styles.subscriptionText}>
              구독하고 광고 없이 앱을 무제한으로 사용해보세요!
            </Text>
          </TouchableOpacity>
          <ScreenBannerAd />
        </>
      )}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    height: 48,
    flexDirection: 'row',
  },
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  center: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  content: {
    flex: 1,
  },
  backIcon: {
    color: Colors.white,
    fontSize: 20,
    marginLeft: 20,
  },
  subscription: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 10,
  },
  subscriptionText: {
    color: Colors.black,
  },
});

export default Screen;
