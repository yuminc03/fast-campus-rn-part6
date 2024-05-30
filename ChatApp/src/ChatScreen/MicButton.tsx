import React, { useCallback, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import AudioRecorderPlayer, {
  AVEncodingOption,
  AudioEncoderAndroidType,
} from 'react-native-audio-recorder-player';

interface MicButtonProps {
  onRecorded: (path: string) => void;
}

const MicButton = ({ onRecorded }: MicButtonProps) => {
  const [recording, setRecording] = useState(false);
  const audioRecorderPlayerRef = useRef(new AudioRecorderPlayer());
  const startRecord = useCallback(async () => {
    if (Platform.OS === 'android') {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      const granted =
        grants[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED;

      if (!granted) {
        return;
      }
    }

    await audioRecorderPlayerRef.current.startRecorder(undefined, {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    });
    audioRecorderPlayerRef.current.addRecordBackListener(() => {});
    setRecording(true);
  }, []);

  const stopRecord = useCallback(async () => {
    const uri = await audioRecorderPlayerRef.current.stopRecorder();
    audioRecorderPlayerRef.current.removeRecordBackListener();
    setRecording(false);
    onRecorded(uri);
  }, [onRecorded]);
};

const styles = StyleSheet.create({});

export default MicButton;
