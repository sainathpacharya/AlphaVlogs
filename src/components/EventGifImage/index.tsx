import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import type {LucideIcon} from 'lucide-react-native';

export interface EventGifImageProps {
  gifUrl: string | null;
  FallbackIcon: LucideIcon;
  width: number;
  height: number;
  color: string;
  backgroundColor?: string;
  borderRadius?: number;
  testID?: string;
}

const EventGifImageComponent: React.FC<EventGifImageProps> = ({
  gifUrl,
  FallbackIcon,
  width,
  height,
  color,
  backgroundColor = 'transparent',
  borderRadius = 0,
  testID,
}) => {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(gifUrl));

  useEffect(() => {
    setFailed(false);
    setLoading(Boolean(gifUrl));
  }, [gifUrl]);

  const handleError = useCallback(() => {
    setFailed(true);
    setLoading(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const frameStyle = useMemo(
    () => ({
      width,
      height,
      borderRadius,
      overflow: 'hidden' as const,
      backgroundColor,
    }),
    [width, height, borderRadius, backgroundColor],
  );

  if (!gifUrl || failed) {
    return (
      <View style={[frameStyle, styles.fallback]} testID={testID}>
        <FallbackIcon
          size={Math.min(width, height) * 0.45}
          color={color}
          strokeWidth={1.75}
        />
      </View>
    );
  }

  return (
    <View style={frameStyle} testID={testID}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={color} />
        </View>
      ) : null}
      <FastImage
        source={{
          uri: gifUrl,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={{width, height}}
        resizeMode={FastImage.resizeMode.contain}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
};

export const EventGifImage = React.memo(EventGifImageComponent);

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export default EventGifImage;
