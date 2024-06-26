import { useCallback, useEffect, useState } from 'react';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import _ from 'lodash';

import { Chat, Collections, Message, User } from '../types';

const getChatKey = (userIds: string[]) => {
  // userId로 정렬
  return _.orderBy(userIds, userId => userId, 'asc');
};

const useChat = (userIds: string[]) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const addNewMessages = useCallback((newMessages: Message[]) => {
    setMessages(prevMessage => {
      // 중복된 메시지를 제외하고 이전 메시지와 합치기
      return _.uniqBy(newMessages.concat(prevMessage), m => m.id);
    });
  }, []);

  const loadUsers = async (uIds: string[]) => {
    // userId 값이 userIds에 속한 사람들만 조회
    const usersSnapshot = await firestore()
      .collection(Collections.USERS)
      .where('userId', 'in', uIds)
      .get();
    const users = usersSnapshot.docs.map<User>(doc => doc.data() as User);
    return users;
  };

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
        const chatUserIds = doc.data().userIds as string[];
        // users DB에서 읽은 최신 user 정보
        const users = await loadUsers(chatUserIds);

        setChat({
          id: doc.id,
          userIds: chatUserIds,
          users: users,
        });
        return;
      }

      const users = await loadUsers(userIds);
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

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  const sendMessage = useCallback(
    async (text: string, user: User) => {
      if (chat?.id == null) {
        throw new Error('Chat is not loaded');
      }

      // firestore.FieldValue.serverTimestamp()는 DB에 들어왔을 때 저장되어서 local에서는 얻기가 어려움
      try {
        setSending(true);
        const doc = await firestore()
          .collection(Collections.CHATS)
          .doc(chat.id)
          .collection(Collections.MESSAGES)
          .add({
            text: text,
            user: user,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        addNewMessages([
          {
            id: doc.id,
            text: text,
            imageUrl: null,
            audioUrl: null,
            user: user,
            createdAt: new Date(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [chat?.id, addNewMessages],
  );

  useEffect(() => {
    if (chat?.id == null) {
      return;
    }

    // message가 추가되었을 때 onSnapshot()이 호출
    // query에 대한 문서가 들어옴 (loadMessages 호출과 같은 효과)
    setLoadingMessages(true);
    const unsubscribe = firestore()
      .collection(Collections.CHATS)
      .doc(chat.id)
      .collection(Collections.MESSAGES)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        if (snapshot.metadata.hasPendingWrites) {
          return;
        }

        const newMessages = snapshot
          .docChanges()
          .filter(({ type }) => type === 'added')
          .map(docChange => {
            const { doc } = docChange;
            const docData = doc.data();
            // 가져온 데이터(docData)를 메시지 타입으로 만들어 return
            const newMessage: Message = {
              id: docData.id,
              text: docData.text ?? null,
              imageUrl: docData.imageUrl ?? null,
              audioUrl: docData.audioUrl ?? null,
              user: docData.user,
              createdAt: docData.createdAt.toDate(),
            };

            return newMessage;
          });

        addNewMessages(newMessages);
        setLoadingMessages(false);
      });

    // hook update or unmount 될 때 실행
    return () => {
      unsubscribe();
    };
  }, [addNewMessages, chat?.id]);

  const updateMessageReadAt = useCallback(
    async (userId: string) => {
      if (chat == null) {
        return null;
      }

      firestore()
        .collection(Collections.CHATS)
        .doc(chat.id)
        .update({
          [`userToMessageReadAt.${userId}`]:
            firestore.FieldValue.serverTimestamp(), // firestore server 시간 기준으로 저장
        });
    },
    [chat],
  );

  const [userToMessageReadAt, setUserToMessageReadAt] = useState<{
    [userId: string]: Date;
  }>({});

  useEffect(() => {
    if (chat == null) {
      return;
    }

    const unsubscribe = firestore()
      .collection(Collections.CHATS)
      .doc(chat?.id)
      .onSnapshot(snapshot => {
        // onSnapshot - firestore의 문서(doc)가 업데이트될 때마다 호출
        if (snapshot.metadata.hasPendingWrites) {
          return;
          // local 변경에 대한 호출은 무시
        }

        const chatData = snapshot.data() ?? {};
        const userToMessagReadTimestamp = chatData.userToMessageReadAt as {
          [userId: string]: FirebaseFirestoreTypes.Timestamp;
        };
        // FirebaseFirestoreTypes.Timestamp에 .toDate()해서 userToMessageDate에 저장
        const userToMessageDate = _.mapValues(
          userToMessagReadTimestamp,
          updateMessageReadTimestemp => updateMessageReadTimestemp.toDate(),
        );
        setUserToMessageReadAt(userToMessageDate);
      });

    return () => {
      unsubscribe();
    };
  }, [chat]);

  const sendImageMessage = useCallback(
    async (filepath: string, user: User) => {
      setSending(true);
      try {
        if (chat == null) {
          throw new Error('Undefined chat');
        }

        if (user == null) {
          throw new Error('Undefined user');
        }

        const originalFileName = _.last(filepath.split('/'));
        if (originalFileName == null) {
          throw new Error('Undefined filename');
        }

        // originalFileName: file.png
        const fileExt = originalFileName.split('.')[1];
        const fileName = `${Date.now()}.${fileExt}`;
        const storagePath = `chat/${chat.id}${fileName}`;
        await storage().ref(storagePath).putFile(filepath);
        const url = await storage().ref(storagePath).getDownloadURL();

        const doc = await firestore()
          .collection(Collections.CHATS)
          .doc(chat.id)
          .collection(Collections.MESSAGES)
          .add({
            imageUrl: url,
            user: user,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        addNewMessages([
          {
            id: doc.id,
            user: user,
            text: null,
            imageUrl: url,
            audioUrl: null,
            createdAt: new Date(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [chat, addNewMessages],
  );

  const sendAudioMessage = useCallback(
    async (filepath: string, user: User) => {
      setSending(true);
      try {
        if (chat == null) {
          throw new Error('Undefined chat');
        }

        if (user == null) {
          throw new Error('Undefined user');
        }

        const originalFileName = _.last(filepath.split('/'));
        if (originalFileName == null) {
          throw new Error('Undefined filename');
        }

        // originalFileName: file.png
        const fileExt = originalFileName.split('.')[1];
        const fileName = `${Date.now()}.${fileExt}`;
        const storagePath = `chat/${chat.id}${fileName}`;
        await storage().ref(storagePath).putFile(filepath);
        const url = await storage().ref(storagePath).getDownloadURL();
        const doc = await firestore()
          .collection(Collections.CHATS)
          .doc(chat.id)
          .collection(Collections.MESSAGES)
          .add({
            audioUrl: url,
            user: user,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        addNewMessages([
          {
            id: doc.id,
            user: user,
            text: null,
            imageUrl: null,
            audioUrl: url,
            createdAt: new Date(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [addNewMessages, chat],
  );

  return {
    chat,
    loadingChat,
    sendMessage,
    messages,
    sending,
    loadingMessages,
    updateMessageReadAt,
    userToMessageReadAt,
    sendAudioMessage,
    sendImageMessage,
  };
};

export default useChat;
