import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useContext } from 'react';

import { RootStackParamList } from './src/types';
import SignupScreen from './src/SignupScreen/SignupScreen';
import AuthProvider from './src/components/AuthProvider';
import SigninScreen from './src/SigninScreen/SigninScreen';
import AuthContext from './src/components/AuthContext';
import HomeScreen from './src/HomeScreen/HomeScreen';
import LoadingScreen from './src/LoadingScreen/LoadingScreen';
import ChatScreen from './src/ChatScreen/ChatScreen';
import usePushNotification from './src/hooks/usePushNotification';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Screens = () => {
  const { user, processingSignin, processingSignup, initialized } =
    useContext(AuthContext);
  usePushNotification();

  const renderRootStack = useCallback(() => {
    if (!initialized) {
      return <Stack.Screen name="Loading" component={LoadingScreen} />;
    }

    if (user != null && !processingSignup && !processingSignin) {
      // login
      return (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      );
    }

    // logout
    return (
      <>
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Signin" component={SigninScreen} />
      </>
    );
  }, [initialized, processingSignin, processingSignup, user]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {renderRootStack()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Screens />
    </AuthProvider>
  );
};

export default App;
