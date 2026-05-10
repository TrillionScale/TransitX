import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck, Camera, AlertCircle } from 'lucide-react-native';
import Svg, { Defs, Ellipse, Mask, Rect } from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { RootStackParamList } from '../navigation';
import { colors, radius, space } from '../theme';
import { isIdentityVerified, markIdentityVerified } from '../state/useIdentity';

type Props = NativeStackScreenProps<RootStackParamList, 'FaceVerify'>;
type Phase = 'checking' | 'permission' | 'camera' | 'analyzing' | 'success' | 'error';
type ScanStep = 'scanning' | 'detecting' | 'locking';

const GEMINI_KEY = (process.env as any).EXPO_PUBLIC_GEMINI_KEY ?? '';
const GEMINI_URL = GEMINI_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`
  : '';

const STEP_MSGS: Record<ScanStep, string> = {
  scanning:  '얼굴을 타원 안에 맞추고 가만히 계세요',
  detecting: '얼굴을 감지하는 중입니다...',
  locking:   '신원 확인 중... 잠시 기다려 주세요',
};

export const FaceVerifyScreen: React.FC<Props> = ({ route, navigation }) => {
  const force = route?.params?.force ?? false;
  const { width: WIN_W, height: WIN_H } = useWindowDimensions();
  const [phase, setPhase]       = useState<Phase>('checking');
  const [scanStep, setScanStep] = useState<ScanStep>('scanning');
  const [errorMsg, setErrorMsg] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef   = useRef<CameraView>(null);
  const timersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const captureRef  = useRef<() => void>(() => {});

  const OVAL_W  = Math.min(WIN_W * 0.70, 256);
  const OVAL_H  = OVAL_W * 1.36;
  const OVAL_CX = WIN_W / 2;
  const OVAL_CY = WIN_H * 0.42;

  // ── Animations ─────────────────────────────────────────────────
  const scanY       = useSharedValue(0);
  const blueGlow    = useSharedValue(0.55);
  const greenAlpha  = useSharedValue(0);
  const lockPulse   = useSharedValue(1);
  const successScale = useSharedValue(0.5);
  const successAlpha = useSharedValue(0);
  const dotProgress  = useSharedValue(0); // 0=scanning 1=detecting 2=locking

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
    opacity: interpolate(greenAlpha.value, [0, 0.6, 1], [0.75, 0.4, 0]),
  }));
  const blueBorderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(greenAlpha.value, [0, 1], [blueGlow.value, 0]),
    shadowOpacity: blueGlow.value * 0.9,
  }));
  const greenBorderStyle = useAnimatedStyle(() => ({
    opacity: greenAlpha.value,
    transform: [{ scale: lockPulse.value }],
  }));
  const successStyle = useAnimatedStyle(() => ({
    opacity: successAlpha.value,
    transform: [{ scale: successScale.value }],
  }));

  useEffect(() => {
    // Scan line bounces
    scanY.value = withRepeat(
      withSequence(
        withTiming(OVAL_H - 4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    // Blue glow pulses
    blueGlow.value = withRepeat(
      withSequence(withTiming(0.95, { duration: 1100 }), withTiming(0.40, { duration: 1100 })),
      -1,
      false,
    );
  }, []);

  // Auto-detection sequence when camera becomes active
  useEffect(() => {
    if (phase !== 'camera') return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setScanStep('scanning');
    greenAlpha.value = 0;
    dotProgress.value = 0;

    const t1 = setTimeout(() => {
      setScanStep('detecting');
      dotProgress.value = withTiming(1, { duration: 500 });
    }, 2200);

    const t2 = setTimeout(() => {
      setScanStep('locking');
      dotProgress.value = withTiming(2, { duration: 400 });
      greenAlpha.value  = withTiming(1, { duration: 700 });
      lockPulse.value   = withRepeat(
        withSequence(withTiming(1.05, { duration: 550 }), withTiming(1, { duration: 550 })),
        -1,
        false,
      );
    }, 3800);

    const t3 = setTimeout(() => {
      captureRef.current();
    }, 5600);

    timersRef.current = [t1, t2, t3];
    return () => timersRef.current.forEach(clearTimeout);
  }, [phase]);

  // Initial check
  useEffect(() => {
    isIdentityVerified().then(verified => {
      if (verified && !force) navigation.replace('CardList');
      else setPhase(permission?.granted ? 'camera' : 'permission');
    });
  }, []);

  useEffect(() => {
    if (phase === 'permission' && permission?.granted) setPhase('camera');
  }, [phase, permission]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.granted) setPhase('camera');
  };

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    setPhase('analyzing');
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.55 });
      if (!photo?.base64) throw new Error('사진 캡처에 실패했습니다');

      if (GEMINI_URL) {
        const res = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: 'Is there a real human face clearly visible and centered in this image? Answer with only "yes" or "no".' },
                { inlineData: { mimeType: 'image/jpeg', data: photo.base64 } },
              ],
            }],
            generationConfig: { maxOutputTokens: 10, temperature: 0 },
          }),
        });
        const json = await res.json();
        const answer = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? '';
        if (!answer.includes('yes')) {
          setErrorMsg('얼굴이 타원 안에 감지되지 않았습니다.\n정면을 바라보고 다시 시도해주세요.');
          setPhase('error');
          return;
        }
      }

      await markIdentityVerified();
      // Success animation
      successScale.value = withSpring(1, { damping: 12, stiffness: 120 });
      successAlpha.value = withTiming(1, { duration: 400 });
      setPhase('success');
      setTimeout(() => {
        if (force) navigation.goBack();
        else navigation.replace('CardList');
      }, 2000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '인증 중 오류가 발생했습니다');
      setPhase('error');
    }
  }, [navigation, force]);

  // Keep capture ref up to date
  useEffect(() => { captureRef.current = handleCapture; }, [handleCapture]);

  // ── Permission screen ─────────────────────────────────────────
  if (phase === 'checking' || phase === 'permission') {
    return (
      <View style={styles.center}>
        <LinearGradient colors={['#020610', '#060D1E', '#0C1530']} style={StyleSheet.absoluteFill} />

        {/* Glow */}
        <View style={styles.permGlow} />

        {/* Logo */}
        <View style={styles.logoWrap}>
          <LinearGradient colors={['#2B70FF', '#1748D8', '#0C2FA8']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.04)', 'transparent']} style={[StyleSheet.absoluteFill, { borderRadius: 28 }]} pointerEvents="none" />
          <View style={styles.xBar1} />
          <View style={styles.xBar2} />
          <View style={styles.logoBorder} />
        </View>

        <Text style={styles.permBrand}>TransitX</Text>
        <Text style={styles.permTitle}>신원 인증</Text>
        <Text style={styles.permSub}>
          얼굴 인식으로 1회만 신원을 확인합니다.{'\n'}이후에는 인증 없이 바로 사용 가능합니다.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>• 사진은 기기 밖으로 전송되지 않습니다</Text>
          <Text style={styles.infoText}>• AI가 실시간으로 얼굴을 확인합니다</Text>
          <Text style={styles.infoText}>• 인증은 단 1회만 진행됩니다</Text>
        </View>

        {phase === 'permission' && (
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
            onPress={handleRequestPermission}
          >
            <LinearGradient colors={['#3B7FFF', '#1F52E0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]} />
            <Camera size={18} color="#fff" strokeWidth={2.2} />
            <Text style={styles.btnText}>카메라 허용하고 시작</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // ── Success screen ────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <View style={styles.center}>
        <LinearGradient colors={['#020610', '#040E14', '#061A0E']} style={StyleSheet.absoluteFill} />
        <View style={styles.successGlow} />
        <Animated.View style={[styles.successIconWrap, successStyle]}>
          <ShieldCheck size={96} color="#00D68F" strokeWidth={1.2} />
        </Animated.View>
        <Text style={[styles.permTitle, { color: '#00D68F', marginTop: 24 }]}>인증 완료!</Text>
        <Text style={styles.permSub}>신원이 확인되었습니다.{'\n'}다음부터는 이 단계가 생략됩니다.</Text>
      </View>
    );
  }

  // ── Error screen ──────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <View style={styles.center}>
        <LinearGradient colors={['#020610', '#0E0A0A', '#1A0808']} style={StyleSheet.absoluteFill} />
        <AlertCircle size={80} color="#FF6B6B" strokeWidth={1.3} />
        <Text style={[styles.permTitle, { color: '#FF6B6B', marginTop: 20 }]}>인증 실패</Text>
        <Text style={styles.permSub}>{errorMsg}</Text>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
          onPress={() => { setScanStep('scanning'); setPhase('camera'); }}
        >
          <LinearGradient colors={['#3B7FFF', '#1F52E0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]} />
          <Text style={styles.btnText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  // ── Camera / Analyzing screen ─────────────────────────────────
  const isAnalyzing = phase === 'analyzing';

  return (
    <View style={styles.root}>
      {/* Camera */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />

      {/* SVG Overlay — real oval cutout */}
      <Svg
        width={WIN_W}
        height={WIN_H}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <Mask id="facemask">
            <Rect x="0" y="0" width={WIN_W} height={WIN_H} fill="white" />
            <Ellipse cx={OVAL_CX} cy={OVAL_CY} rx={OVAL_W / 2} ry={OVAL_H / 2} fill="black" />
          </Mask>
        </Defs>
        <Rect
          x="0" y="0"
          width={WIN_W} height={WIN_H}
          fill="rgba(2,6,18,0.82)"
          mask="url(#facemask)"
        />
      </Svg>

      {/* Oval scan content (clipped inside oval) */}
      <View
        pointerEvents="none"
        style={[
          styles.ovalClip,
          {
            width: OVAL_W,
            height: OVAL_H,
            borderRadius: OVAL_W,
            left: OVAL_CX - OVAL_W / 2,
            top: OVAL_CY - OVAL_H / 2,
          },
        ]}
      >
        {/* Scan line */}
        {!isAnalyzing && (
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
        )}
        {/* Top shimmer inside oval */}
        <LinearGradient
          colors={['rgba(59,127,255,0.18)', 'transparent']}
          style={styles.ovalTopShimmer}
          pointerEvents="none"
        />
      </View>

      {/* Blue animated border */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ovalBorder,
          styles.blueBorder,
          {
            width: OVAL_W + 4,
            height: OVAL_H + 4,
            borderRadius: OVAL_W,
            left: OVAL_CX - OVAL_W / 2 - 2,
            top: OVAL_CY - OVAL_H / 2 - 2,
          },
          blueBorderStyle,
        ]}
      />

      {/* Green border (locking) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ovalBorder,
          styles.greenBorder,
          {
            width: OVAL_W + 6,
            height: OVAL_H + 6,
            borderRadius: OVAL_W,
            left: OVAL_CX - OVAL_W / 2 - 3,
            top: OVAL_CY - OVAL_H / 2 - 3,
          },
          greenBorderStyle,
        ]}
      />

      {/* Corner brackets */}
      {(['TL', 'TR', 'BL', 'BR'] as const).map(pos => (
        <CornerBracket
          key={pos}
          pos={pos}
          cx={OVAL_CX}
          cy={OVAL_CY}
          ovalW={OVAL_W}
          ovalH={OVAL_H}
          green={scanStep === 'locking'}
        />
      ))}

      {/* Top area */}
      <LinearGradient
        colors={['rgba(2,6,18,0.92)', 'rgba(2,6,18,0.60)', 'transparent']}
        style={styles.topGrad}
        pointerEvents="none"
      />
      <View style={styles.topArea}>
        <Text style={styles.hintTitle}>신원 인증</Text>
        <Text style={[
          styles.hintSub,
          scanStep === 'locking' && { color: '#00D68F' },
          isAnalyzing && { color: '#F4C56B' },
        ]}>
          {isAnalyzing ? '인증 처리 중...' : STEP_MSGS[scanStep]}
        </Text>
      </View>

      {/* Bottom area */}
      <LinearGradient
        colors={['transparent', 'rgba(2,6,18,0.75)', 'rgba(2,6,18,0.95)']}
        style={styles.bottomGrad}
        pointerEvents="none"
      />
      <View style={styles.bottomArea}>
        {/* Step progress dots */}
        <StepDots step={scanStep} isAnalyzing={isAnalyzing} />

        {isAnalyzing ? (
          <Text style={styles.analyzingText}>AI 얼굴 분석 중…</Text>
        ) : (
          <Text style={styles.bottomHint}>자동으로 인식합니다 — 움직이지 마세요</Text>
        )}

        {/* Cancel button */}
        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>취소</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ── Corner bracket decoration ────────────────────────────────────
type Pos = 'TL' | 'TR' | 'BL' | 'BR';
const CornerBracket: React.FC<{
  pos: Pos; cx: number; cy: number; ovalW: number; ovalH: number; green: boolean;
}> = ({ pos, cx, cy, ovalW, ovalH, green }) => {
  const SZ = 22;
  const INSET = 12;
  const ox = ovalW / 2 - INSET;
  const oy = ovalH / 2 - INSET;
  const isLeft = pos === 'TL' || pos === 'BL';
  const isTop  = pos === 'TL' || pos === 'TR';
  const x = cx + (isLeft ? -ox - SZ : ox);
  const y = cy + (isTop ? -oy - SZ : oy);
  const color = green ? '#00D68F' : '#3B7FFF';
  const borders: any = {
    ...(isTop  ? { borderTopWidth: 2.5 }    : { borderBottomWidth: 2.5 }),
    ...(isLeft ? { borderLeftWidth: 2.5 }   : { borderRightWidth: 2.5 }),
    ...(!isTop && !isLeft ? { borderBottomRightRadius: 6 } : {}),
    ...(isTop  &&  isLeft ? { borderTopLeftRadius: 6 }     : {}),
    ...(isTop  && !isLeft ? { borderTopRightRadius: 6 }    : {}),
    ...(!isTop &&  isLeft ? { borderBottomLeftRadius: 6 }  : {}),
  };
  return (
    <View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: SZ, height: SZ, borderColor: color },
        borders,
        { left: x, top: y },
      ]}
    />
  );
};

// ── Step progress indicator ──────────────────────────────────────
const StepDots: React.FC<{ step: ScanStep; isAnalyzing: boolean }> = ({ step, isAnalyzing }) => {
  const steps = [
    { key: 'scanning',  label: '얼굴 감지', done: step !== 'scanning' || isAnalyzing },
    { key: 'detecting', label: '얼굴 확인', done: step === 'locking' || isAnalyzing },
    { key: 'locking',   label: '신원 인증', done: isAnalyzing },
  ] as const;

  return (
    <View style={styles.stepsRow}>
      {steps.map(({ key, label, done }, i) => {
        const active = !done && (
          (key === 'scanning' && step === 'scanning') ||
          (key === 'detecting' && step === 'detecting') ||
          (key === 'locking' && step === 'locking')
        );
        return (
          <React.Fragment key={key}>
            {i > 0 && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
            <View style={styles.stepItem}>
              <View style={[
                styles.stepDot,
                active && styles.stepDotActive,
                done && styles.stepDotDone,
              ]}>
                {done && <View style={styles.stepDotInner} />}
              </View>
              <Text style={[
                styles.stepLabel,
                active && { color: '#3B7FFF' },
                done && { color: '#00D68F' },
              ]}>
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  // ── Center layouts (permission/success/error) ─────────────────
  center: {
    flex: 1,
    backgroundColor: '#020610',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    gap: space.lg,
  },
  permGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(43,112,255,0.14)',
    shadowColor: '#2B70FF',
    shadowOpacity: 1,
    shadowRadius: 70,
    shadowOffset: { width: 0, height: 0 },
  },
  successGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,214,143,0.12)',
    shadowColor: '#00D68F',
    shadowOpacity: 1,
    shadowRadius: 70,
    shadowOffset: { width: 0, height: 0 },
  },
  successIconWrap: { alignItems: 'center', justifyContent: 'center' },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A44E0',
    shadowOpacity: 0.80,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  logoBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(100,165,255,0.38)',
  },
  xBar1: {
    position: 'absolute',
    width: 52,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.96)',
    transform: [{ rotate: '45deg' }],
  },
  xBar2: {
    position: 'absolute',
    width: 52,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.96)',
    transform: [{ rotate: '-45deg' }],
  },
  permBrand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontFamily: 'Unbounded-Black',
  },
  permTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  permSub: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: space.lg,
    gap: space.sm,
    width: '100%',
  },
  infoText: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  btn: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    paddingHorizontal: space.xl,
    paddingVertical: 16,
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1A44E0',
    shadowOpacity: 0.60,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },

  // ── Camera overlay ────────────────────────────────────────────
  ovalClip: {
    position: 'absolute',
    overflow: 'hidden',
  },
  ovalTopShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: 9999,
    borderTopRightRadius: 9999,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3B7FFF',
    shadowColor: '#3B7FFF',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  ovalBorder: {
    position: 'absolute',
  },
  blueBorder: {
    borderWidth: 2,
    borderColor: '#3B7FFF',
    shadowColor: '#3B7FFF',
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  greenBorder: {
    borderWidth: 2.5,
    borderColor: '#00D68F',
    shadowColor: '#00D68F',
    shadowOpacity: 0.9,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },

  // ── Top / Bottom gradient areas ───────────────────────────────
  topGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  topArea: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  hintTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  hintSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  analyzingText: {
    color: '#F4C56B',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bottomHint: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Step dots ─────────────────────────────────────────────────
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepItem: { alignItems: 'center', gap: 5 },
  stepLine: {
    width: 32,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16,
  },
  stepLineDone: { backgroundColor: '#00D68F' },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: '#3B7FFF',
    backgroundColor: 'rgba(59,127,255,0.18)',
    shadowColor: '#3B7FFF',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  stepDotDone: {
    borderColor: '#00D68F',
    backgroundColor: 'rgba(0,214,143,0.18)',
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D68F',
  },
  stepLabel: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
