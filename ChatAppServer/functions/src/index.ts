import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

export const onMessageCreated = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    // snap - 바뀐 문서의 정보
    // context - 문서의 데이터
    // 새 메시지가 생기면 해당 채팅방에 있는 사용자에게 push를 보낸다.
    // 1. 어디로 메시지를 보내는지?
    const chatId = context.params.chatId;
    const chatSnapshot = await getFirestore()
      .collection("chats")
      .doc(chatId)
      .get();
    const chat = chatSnapshot.data();

    if (chat == null) {
      return;
    }

    const message = snap.data();
    const senderId = message.user.userId;
    const userIds = (chat.userIds as string[]).filter(
      (userId) => userId != senderId
    );
    const usersSnapshot = await getFirestore()
      .collection("users")
      .where("userId", "in", userIds)
      .get();
    const usersFcmTokens = usersSnapshot.docs.map(
      (doc) => doc.data().fcmTokens as string[]
    );
    const fcmTokens = usersFcmTokens.reduce((allTokens, tokens) => {
      return allTokens.concat(tokens);
    }, []);

    // 2. 메시지를 보내기
    // title - "메시지가 도착했습니다"
    // body - "text, audio, image"
    const messageText = (() => {
      if (message.text != null) {
        return message.text as string;
      }

      if (message.imageUrl != null) {
        return "사진";
      }

      if (message.audioUrl != null) {
        return "음성메시지";
      }
      return "지원하지 않는 메시지";
    })();
    const senderName = message.user.name;

    getMessaging().sendMulticast({
      notification: {
        title: "메시지가 도착했습니다.",
        body: `${senderName}: ${messageText}`,
      },
      data: {
        userIds: JSON.stringify(chat.userIds),
      },
      tokens: fcmTokens,
    });

    console.log("Done");
  });
