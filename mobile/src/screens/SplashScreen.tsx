import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = { onDone: () => void };

const MAX_W = 430;

export const SplashScreen: React.FC<Props> = ({ onDone }) => {
  const { width: WIN_W } = useWindowDimensions();
  const isPC = Platform.OS === 'web' && WIN_W > MAX_W + 40;

  const logoScale   = useSharedValue(0.52);
  const logoOpacity = useSharedValue(0);
  const glowScale   = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const ringScale   = useSharedValue(0.7);
  const textOpacity = useSharedValue(0);
  const textY       = useSharedValue(18);
  const tagOpacity  = useSharedValue(0);
  const dotOpacity  = useSharedValue(0);
  const dot1W       = useSharedValue(6);
  const dot2W       = useSharedValue(20);
  const dot3W       = useSharedValue(6);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 420 });
    logoScale.value   = withSpring(1, { damping: 13, stiffness: 110 });
    glowOpacity.value = withDelay(200, withTiming(1, { duration: 700 }));
    glowScale.value   = withDelay(200, withSpring(1, { damping: 18, stiffness: 90 }));
    ringOpacity.value = withDelay(400, withTiming(0.6, { duration: 500 }));
    ringScale.value   = withDelay(400, withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1100, easing: Easing.out(Easing.ease) }),
        withTiming(0.95, { duration: 1100, easing: Easing.in(Easing.ease) }),
      ), -1, false,
    ));
    textOpacity.value = withDelay(520, withTiming(1, { duration: 600 }));
    textY.value       = withDelay(520, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    tagOpacity.value  = withDelay(900, withTiming(1, { duration: 700 }));
    dotOpacity.value  = withDelay(1100, withTiming(1, { duration: 400 }));
    dot1W.value = withDelay(1400, withSequence(withTiming(20, { duration: 300 }), withTiming(6, { duration: 300 })));
    dot2W.value = withDelay(1700, withSequence(withTiming(20, { duration: 300 }), withTiming(6, { duration: 300 })));
    dot3W.value = withDelay(2000, withSequence(withTiming(20, { duration: 300 }), withTiming(6, { duration: 300 })));
    const t = setTimeout(onDone, 2900);
    return () => clearTimeout(t);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value, transform: [{ scale: logoScale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value, transform: [{ scale: glowScale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ringOpacity.value, transform: [{ scale: ringScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value, transform: [{ translateY: textY.value }] }));
  const tagStyle  = useAnimatedStyle(() => ({ opacity: tagOpacity.value }));
  const dotsStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));
  const d1Style   = useAnimatedStyle(() => ({ width: dot1W.value }));
  const d2Style   = useAnimatedStyle(() => ({ width: dot2W.value }));
  const d3Style   = useAnimatedStyle(() => ({ width: dot3W.value }));

  const content = (
    <View style={styles.inner}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.ring, ringStyle]} />

      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <LinearGradient colors={['#2B70FF', '#1748D8', '#0C2FA8']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.06)', 'transparent']} locations={[0, 0.45, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 30 }]} pointerEvents="none" />
        <View style={styles.xBar1} />
        <View style={styles.xBar2} />
        <View style={styles.logoBorder} />
      </Animated.View>

      <Animated.Text style={[styles.brand, textStyle]}>TransitX</Animated.Text>
      <Animated.Text style={[styles.tagline, tagStyle]}>국경 없는 이동 · 결제 · 초고속 환전</Animated.Text>

      <Animated.View style={[styles.dotsRow, dotsStyle]}>
        <Animated.View style={[styles.dot, d1Style]} />
        <Animated.View style={[styles.dot, d2Style]} />
        <Animated.View style={[styles.dot, d3Style]} />
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#020610', '#060D1E', '#0A1030']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      {isPC ? (
        <View style={styles.pcOuter}>
          <View style={styles.pcFrame}>{content}</View>
        </View>
      ) : content}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020610' },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pcOuter: {
    flex: 1,
    alignItems: 'center',
  },
  pcFrame: {
    width: MAX_W,
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  } as ViewStyle,

  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(43,112,255,0.16)',
    shadowColor: '#2B70FF',
    shadowOpacity: 1,
    shadowRadius: 90,
    shadowOffset: { width: 0, height: 0 },
  },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(59,127,255,0.30)',
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A44E0',
    shadowOpacity: 0.85,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  logoBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(100,165,255,0.40)',
  },
  xBar1: {
    position: 'absolute',
    width: 56,
    height: 8.5,
    borderRadius: 4.5,
    backgroundColor: 'rgba(255,255,255,0.96)',
    transform: [{ rotate: '45deg' }],
  },
  xBar2: {
    position: 'absolute',
    width: 56,
    height: 8.5,
    borderRadius: 4.5,
    backgroundColor: 'rgba(255,255,255,0.96)',
    transform: [{ rotate: '-45deg' }],
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: 'Unbounded-Black',
    marginTop: 20,
  },
  tagline: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    position: 'absolute',
    bottom: 64,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2B70FF',
    opacity: 0.85,
  },
});
