import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';

import Screen from '../components/Screen';
import { RootStackParamList } from '../types';

const ChatScreen = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { other } = params;
  return <Screen title={other.name} />;
};

export default ChatScreen;
