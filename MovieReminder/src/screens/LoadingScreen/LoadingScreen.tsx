import OpenColor from 'open-color';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import LoadingBar from './LoadingBar';

interface LoadingScreenProp {
  progress?: {
    now: number;
    total: number;
  };
}
const LoadingScreen = ({ progress }: LoadingScreenProp) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
      {progress != null && (
        <View style={styles.loadingBar}>
          <LoadingBar width={200} total={progress.total} now={progress.now} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: OpenColor.white,
  },
  loadingBar: {
    marginTop: 20,
  },
});

export default LoadingScreen;
