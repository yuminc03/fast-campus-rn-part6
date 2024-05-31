import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors } from '../modules/Colors';

interface AudioMessageProps {
  url: string;
  isOtherMessage?: boolean;
}

const AudioMessage = ({ url, isOtherMessage }: AudioMessageProps) => {
  const messageStyle = isOtherMessage ? otherMessageStyles : styles;
  const [playing, setPlaying] = useState(false);
  const [remainingTimeInMs, setRemainingTimeInMs] = useState(0);
  const audioPlayerRef = useRef(new AudioRecorderPlayer());

  const stopPlay = useCallback(async () => {
    await audioPlayerRef.current.stopPlayer();
    setPlaying(false);
    audioPlayerRef.current.removePlayBackListener();
  }, []);

  const startPlay = useCallback(async () => {
    await audioPlayerRef.current.startPlayer(url);
    setPlaying(true);
    // 남은 시간 = 전체 시간 - 현재 시간
    audioPlayerRef.current.addPlayBackListener(e => {
      const timeInMs = e.duration - e.currentPosition;
      setRemainingTimeInMs(e.duration - e.currentPosition);
      if (timeInMs === 0) {
        stopPlay();
      }
    });
  }, [stopPlay, url]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={playing ? stopPlay : startPlay}>
        <Icon
          name={playing ? 'stop' : 'play-arrow'}
          style={messageStyle.icon}
        />
      </TouchableOpacity>
      <Text style={messageStyle.timeText}>
        {audioPlayerRef.current.mmss(Math.floor(remainingTimeInMs / 1000))}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    color: Colors.WHITE,
  },
  timeText: {
    fontSize: 14,
    color: Colors.WHITE,
    minWidth: 48,
  },
});

const otherMessageStyles = {
  icon: [styles.icon, { color: Colors.BLACK }],
  timeText: [styles.timeText, { color: Colors.BLACK }],
};

export default AudioMessage;
