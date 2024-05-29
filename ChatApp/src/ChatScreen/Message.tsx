import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import moment from 'moment';

interface MessageProps {
  name: string;
  text: string;
  createdAt: Date;
  isOtherMessage: boolean;
}

const Message = ({ name, text, createdAt, isOtherMessage }: MessageProps) => {
  const renderMessageContainer = useCallback(() => {
    return (
      <>
        <Text style={styles.timeText}>{moment(createdAt).format('HH:mm')}</Text>
        <View style={styles.bubble}>
          <Text style={styles.messageText}>{text}</Text>
        </View>
      </>
    );
  }, [createdAt, text]);

  return (
    <View style={styles.container}>
      <Text style={styles.nameText}>{name}</Text>
      <View style={styles.messageContainer}>{renderMessageContainer()}</View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Message;
