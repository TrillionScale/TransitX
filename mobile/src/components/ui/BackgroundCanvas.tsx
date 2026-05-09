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
import { useThemeMode } from '../../state/useThemeMode';

const { width: W, height: H } = Dimensions.get('window');
const BLOB = Math.max(W, H) * 1.6;

/**
 * 페일 베이스 + 부드러운 RadialGradient blob들이 천천히 일렁임.
 * 가장자리 자연스럽게 fade — 도형 X.
 */
export const BackgroundCanvas: React.FC = () => {
  const { mode } = useThemeMode();
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

  const isDark = mode === 'dark';
  const baseColors = isDark
    ? (['#000000', '#070710', '#0C0C18', '#000000'] as const)
    : (['#9CB8DD', '#B6CADE', '#D4D2CA', '#E5D4BA'] as const);

  const blobs = isDark
    ? [
        { color: '#1A2452', opacity: 0.35 },
        { color: '#2E4296', opacity: 0.20 },
        { color: '#101A40', opacity: 0.30 },
      ]
    : [
        { color: '#3B5DCC', opacity: 0.7 },
        { color: '#A8D2E5', opacity: 0.65 },
        { color: '#F2C896', opacity: 0.6 },
      ];

  return (
    <View pointerEvents="none" style={[styles.root, { backgroundColor: isDark ? '#000000' : '#B6CADE' }]}>
      {/* 베이스 */}
      <LinearGradient
        colors={baseColors}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Blob color={blobs[0].color} opacity={blobs[0].opacity} animatedStyle={blob1Style} />
      <Blob color={blobs[1].color} opacity={blobs[1].opacity} animatedStyle={blob2Style} />
      <Blob color={blobs[2].color} opacity={blobs[2].opacity} animatedStyle={blob3Style} />

      {/* 하단 투톤 동그라미 글로우 */}
      <View pointerEvents="none" style={styles.bottomGlow}>
        <Svg width={W * 2.2} height={W * 2.2}>
          <Defs>
            {isDark ? (
              <>
                <RadialGradient id="bottomGlowOuter" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#CFEEFF" stopOpacity="0.42" />
                  <Stop offset="50%" stopColor="#A8DFFA" stopOpacity="0.30" />
                  <Stop offset="80%" stopColor="#7FD8FF" stopOpacity="0.10" />
                  <Stop offset="100%" stopColor="#7FD8FF" stopOpacity="0" />
                </RadialGradient>
                <RadialGradient id="bottomGlowInner" cx="50%" cy="50%" r="32%">
                  <Stop offset="0%" stopColor="#0A2A8C" stopOpacity="0.95" />
                  <Stop offset="50%" stopColor="#1240B5" stopOpacity="0.7" />
                  <Stop offset="100%" stopColor="#1240B5" stopOpacity="0" />
                </RadialGradient>
              </>
            ) : (
              <>
                {/* 바깥 링: 베이지 글로우 — 배경 베이지와 톤 통일 */}
                <RadialGradient id="bottomGlowOuter" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#F2D6B0" stopOpacity="0.55" />
                  <Stop offset="55%" stopColor="#F2D6B0" stopOpacity="0.40" />
                  <Stop offset="80%" stopColor="#E5C896" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#E5C896" stopOpacity="0" />
                </RadialGradient>
                {/* 안쪽 코어: 스카이 블루 — 배경 블루와 톤 통일 */}
                <RadialGradient id="bottomGlowInner" cx="50%" cy="50%" r="32%">
                  <Stop offset="0%" stopColor="#7AB8FF" stopOpacity="0.75" />
                  <Stop offset="50%" stopColor="#9CC8F5" stopOpacity="0.45" />
                  <Stop offset="100%" stopColor="#9CC8F5" stopOpacity="0" />
                </RadialGradient>
              </>
            )}
          </Defs>
          <Rect x="0" y="0" width={W * 2.2} height={W * 2.2} fill="url(#bottomGlowOuter)" />
          <Rect x="0" y="0" width={W * 2.2} height={W * 2.2} fill="url(#bottomGlowInner)" />
        </Svg>
      </View>
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
  bottomGlow: {
    position: 'absolute',
    bottom: -W * 0.9,
    left: -W * 0.6,
    width: W * 2.2,
    height: W * 2.2,
  },
});
