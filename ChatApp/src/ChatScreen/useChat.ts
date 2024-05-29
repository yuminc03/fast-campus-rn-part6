import { useCallback, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import _ from 'lodash';

import {
  Chat,
  Collections,
  FirestoreMessageData,
  Message,
  User,
} from '../types';

const getChatKey = (userIDs: string[]) => {
  // userId로 정렬
  return _.orderBy(userIDs, userId => userId, 'asc');
};

const useChat = (userIds: string[]) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  const loadChat = useCallback(async () => {
    try {
      setLoadingChat(true);
      // userIds와 같은 key를 찾음
      const chatSnapshot = await firestore()
        .collection(Collections.CHATS)
        .where('userIds', '==', getChatKey(userIds))
        .get();

      if (chatSnapshot.docs.length > 0) {
        const doc = chatSnapshot.docs[0];
        setChat({
          id: doc.id,
          userIds: doc.data().userIds as string[],
          users: doc.data().users as User[],
        });
        return;
      }

      // userId 값이 userIds에 속한 사람들만 조회
      const usersSnapshot = await firestore()
        .collection(Collections.USERS)
        .where('userId', 'in', userIds)
        .get();
      const users = usersSnapshot.docs.map(doc => doc.data() as User);
      const data = {
        userIds: getChatKey(userIds),
        users,
      };
      // add - id 자동생성, doc - id를 사용자 맘대로 정함
      const doc = await firestore().collection(Collections.CHATS).add(data);
      setChat({
        id: doc.id,
        ...data,
      });
    } finally {
      setLoadingChat(false);
    }
  }, [userIds]);

  const sendMessage = useCallback(
    async (text: string, user: User) => {
      if (chat?.id == null) {
        throw new Error('Chat is not loaded');
      }

      try {
        setSending(true);
        const data: FirestoreMessageData = {
          text: text,
          user: user,
          createdAt: new Date(),
        };

        const doc = await firestore()
          .collection(Collections.CHATS)
          .doc(chat.id)
          .collection(Collections.MESSAGES)
          .add(data);

        setMessages(prevMessages =>
          prevMessages.concat([
            {
              id: doc.id,
              ...data,
            },
          ]),
        );
      } finally {
        setSending(false);
      }
    },
    [chat?.id],
  );

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  return {
    chat,
    loadingChat,
    sendMessage,
    messages,
    sending,
  };
};

export default useChat;
