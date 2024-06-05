import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootStackParamList } from './src/types';
import MoviesScreen from './src/screens/MoviesScreen/MoviesScreen';
import MovieScreen from './src/screens/MovieScreen/MovieScreen';
import RemindersScreen from './src/screens/RemindersScreen/RemindersScreen';
import PurchaseScreen from './src/screens/PurchaseScreen/PurchaseScreen';
import SubscriptionProvider from './src/components/SubscriptionProvider';
import LoadingScreen from './src/screens/LoadingScreen/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

const App = () => {
  const updating = false;
  const progress = {
    total: 100,
    now: 50,
  };

  return (
    // subscribed 정보를 어디서든 사용할 수 있게 함
    <SubscriptionProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {updating ? (
              <Stack.Screen name="Loading">
                {prop => (
                  <LoadingScreen
                    {...prop}
                    progress={progress != null ? progress : undefined}
                  />
                )}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Movies" component={MoviesScreen} />
                <Stack.Screen name="Movie" component={MovieScreen} />
                <Stack.Screen name="Reminders" component={RemindersScreen} />
                <Stack.Screen name="Purchase" component={PurchaseScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SubscriptionProvider>
  );
};

export default App;
