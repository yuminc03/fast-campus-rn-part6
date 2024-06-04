import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from 'open-color';

interface ScreenProps {
  title?: string;
  children?: React.ReactNode;
  headerVisible?: boolean;
  renderRightComponent?: () => JSX.Element;
}

const Screen = ({
  children,
  title,
  headerVisible = true,
  renderRightComponent,
}: ScreenProps) => {
  const { goBack, canGoBack } = useNavigation();
  const onPressBackButton = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'ios' ? (
        <StatusBar barStyle="light-content" />
      ) : (
        <StatusBar barStyle="dark-content" />
      )}
      {headerVisible && (
        <View style={styles.header}>
          <View style={styles.left}>
            {canGoBack() && (
              <TouchableOpacity onPress={onPressBackButton}>
                <Icon style={styles.backButtonIcon} name="arrow-back" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.center}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <View style={styles.right}>
            {renderRightComponent != null && renderRightComponent()}
          </View>
        </View>
      )}
      <View style={styles.body}>{children}</View>
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
  body: {
    flex: 1,
  },
  backButtonIcon: {
    color: Colors.black,
    fontSize: 20,
    marginLeft: 20,
  },
});

export default Screen;
