import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from 'open-color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import mobileAds from 'react-native-google-mobile-ads';

import useMovies from './useMovies';
import Movie from './Movie';
import Screen from '../../components/Screen';
import { RootStackParamList } from '../../types';

const MoviesScreen = () => {
  const { movies, isLoading, loadMore, canLoadMore, refresh } = useMovies();
  const [adsInitialized, setAdsInitialized] = useState(false);
  const { navigate } =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      await mobileAds().initialize();
      setAdsInitialized(true);
    })();
  }, []);

  const renderRightComponent = useCallback(() => {
    return (
      <View style={styles.headerRightComponent}>
        <TouchableOpacity
          style={styles.alarmButton}
          onPress={() => {
            navigate('Reminders');
          }}>
          <Icon name="notifications" style={styles.alarmIcon} />
        </TouchableOpacity>
      </View>
    );
  }, [navigate]);

  return (
    <Screen renderRightComponent={renderRightComponent}>
      {isLoading || !adsInitialized ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.movieList}
          data={movies}
          renderItem={({ item: movie }) => (
            <Movie
              id={movie.id}
              title={movie.title}
              originalTitle={movie.originalTitle}
              releaseDate={movie.releaseDate}
              overview={movie.overview}
              posterUrl={movie.posterUrl ?? undefined}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={() => {
            if (canLoadMore) {
              loadMore();
            }
          }}
          refreshControl={
            <RefreshControl
              tintColor={Colors.white}
              refreshing={isLoading}
              onRefresh={refresh}
            />
          }
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  movieList: {
    padding: 20,
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmButton: {},
  alarmIcon: {
    fontSize: 24,
    color: Colors.white,
  },
});

export default MoviesScreen;
