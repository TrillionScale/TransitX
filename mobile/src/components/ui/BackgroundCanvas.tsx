import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');
const BLOB = Math.max(W, H) * 1.6;

/**
 * 페일 베이스 + 부드러운 RadialGradient blob들이 천천히 일렁임.
 * 가장자리 자연스럽게 fade — 도형 X.
 */
export const BackgroundCanvas: React.FC = () => {
  const t1 = useSharedValue(0);
  const t2 = useSharedValue(0);
  const t3 = useSharedValue(0);

  useEffect(() => {
    t1.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
    t2.value = withRepeat(withTiming(1, { duration: 13000, easing: Easing.inOut(Easing.sin) }), -1, true);
    t3.value = withRepeat(withTiming(1, { duration: 17000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t1, t2, t3]);

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -W * 0.3 + t1.value * W * 0.7 },
      { translateY: -H * 0.2 + t1.value * H * 0.4 },
    ],
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: W * 0.4 - t2.value * W * 0.8 },
      { translateY: H * 0.5 - t2.value * H * 0.7 },
    ],
  }));

  const blob3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: W * 0.3 - t3.value * W * 0.5 },
      { translateY: -H * 0.1 + t3.value * H * 0.6 },
    ],
  }));

  return (
    <View pointerEvents="none" style={styles.root}>
      {/* 베이스 */}
      <LinearGradient
        colors={['#9CB8DD', '#B6CADE', '#D4D2CA', '#E5D4BA']}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Blob color="#3B5DCC" opacity={0.7} animatedStyle={blob1Style} />
      <Blob color="#A8D2E5" opacity={0.65} animatedStyle={blob2Style} />
      <Blob color="#F2C896" opacity={0.6} animatedStyle={blob3Style} />
    </View>
  );
};

// SVG RadialGradient blob — 가운데 진하고 가장자리 0% 투명
const Blob: React.FC<{
  color: string;
  opacity: number;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}> = ({ color, opacity, animatedStyle }) => {
  const id = `blob-${color.replace('#', '')}`;
  return (
    <Animated.View style={[styles.blob, animatedStyle]}>
      <Svg width={BLOB} height={BLOB}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="50%" stopColor={color} stopOpacity={opacity * 0.5} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={BLOB} height={BLOB} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#B6CADE',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: BLOB,
    height: BLOB,
    left: (W - BLOB) / 2,
    top: (H - BLOB) / 2,
  },
});
