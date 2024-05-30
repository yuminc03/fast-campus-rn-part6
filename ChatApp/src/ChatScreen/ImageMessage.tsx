import React, { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import ImageView from 'react-native-image-viewing';

interface ImageMessageProps {
  url: string;
}

const ImageMessage = ({ url }: ImageMessageProps) => {
  const [viewerVisible, setViwerVisible] = useState(false);
  const images = useMemo(() => (url != null ? [{ uri: url }] : []), [url]);
  const showImageViewer = useCallback(() => {
    setViwerVisible(true);
  }, []);

  return (
    <>
      <TouchableOpacity onPress={showImageViewer}>
        <Image
          style={styles.image}
          source={{ uri: url }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <ImageView
        images={images}
        imageIndex={0}
        visible={viewerVisible}
        onRequestClose={() => setViwerVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  },
});

export default ImageMessage;
