import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, X, Nfc, ArrowRightLeft } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { CardItem } from '../components/CardItem';
import { MetalChip } from '../components/MetalChip';
import { useCards } from '../state/useCards';
import { usePaymentFlow } from '../state/usePaymentFlow';
import { RootStackParamList } from '../navigation';
import { colors, font, radius, space } from '../theme';
import { formatAmount } from '../format';
import { waitForNfcTap, cancelNfc } from '../nfc';

type Props = NativeStackScreenProps<RootStackParamList, 'Pay'>;

const EXPLORER_BASE = 'https://testnet.xrpl.org/transactions/';

export const PayScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cardId } = route.params;
  const { cards } = useCards();
  const card = cards.find((c) => c.id === cardId);
  const flow = usePaymentFlow(cardId);

  // 화면 진입 시 진짜 NFC 세션 시작. 태그 감지되면 테스트 alert → mock 결제 flow.
  // 실패(시뮬레이터/권한/타임아웃)면 1.2초 후 mock으로 fallback.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await waitForNfcTap();
        if (cancelled) return;
        Alert.alert(
          'NFC 테스트 성공',
          '(완성 시 이 팝업을 지웁시다)',
          [{ text: '결제 진행', onPress: () => flow.start() }],
        );
      } catch {
        if (cancelled) return;
        // NFC 안 됨 → mock fallback
        setTimeout(() => {
          if (!cancelled) flow.start();
        }, 1200);
      }
    };

    run();
    return () => {
      cancelled = true;
      cancelNfc();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 결제 완료 후 1.8s 뒤 자동 닫기
  useEffect(() => {
    if (flow.phase === 'success') {
      const t = setTimeout(() => navigation.goBack(), 1800);
      return () => clearTimeout(t);
    }
  }, [flow.phase, navigation]);

  if (!card) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Close button */}
      <View style={styles.topBar}>
        <Pressable
          hitSlop={12}
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
        >
          <X size={20} color={colors.text} strokeWidth={2} />
        </Pressable>
      </View>

      {/* 카드 — 가운데 살짝 위에 */}
      <View style={styles.cardArea}>
        <CardItem card={card} variant="list" />
      </View>

      {/* 상태 영역 — phase에 따라 컨텐츠 변경 */}
      <View style={styles.statusArea}>
        <PhaseContent flow={flow} card={card} />
      </View>

      {/* 하단 영역 — 결과 모달 */}
      {flow.phase === 'success' && flow.result && (
        <SuccessFooter
          krwAmount={flow.krwAmount}
          usdAmount={flow.quote?.sendMaxUsd ?? 0}
          rate={flow.quote?.rate ?? 0}
          hash={flow.result.hash}
        />
      )}
    </SafeAreaView>
  );
};

// ─── phase별 컨텐츠 ──────────────────────────────────────────────

type PhaseProps = {
  flow: ReturnType<typeof usePaymentFlow>;
  card: ReturnType<typeof useCards>['cards'][number];
};

const PhaseContent: React.FC<PhaseProps> = ({ flow, card }) => {
  switch (flow.phase) {
    case 'idle':
    case 'tagDetected':
      return <NfcWaiting />;
    case 'quoting':
      return <Quoting />;
    case 'exchanging':
      return (
        <Exchanging
          krwAmount={flow.krwAmount}
          usdAmount={flow.quote?.sendMaxUsd ?? 0}
          rate={flow.quote?.rate ?? 0}
        />
      );
    case 'submitting':
      return <Submitting krwAmount={flow.krwAmount} usdAmount={flow.quote?.sendMaxUsd ?? 0} />;
    case 'success':
      return <SuccessHeader />;
    case 'error':
      return <ErrorState message={flow.error ?? ''} onRetry={flow.start} />;
  }
};

// ─── phase 컴포넌트들 ─────────────────────────────────────────────

const NfcWaiting: React.FC = () => {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  // 두 개 ring이 메탈 칩에서 발산되어 퍼짐 — Apple Pay 스타일
  const ring1 = useAnimatedStyle(() => ({
    opacity: (1 - pulse.value) * 0.7,
    transform: [{ scale: 0.6 + pulse.value * 1.4 }],
  }));
  const ring2 = useAnimatedStyle(() => ({
    opacity: (1 - pulse.value) * 0.4,
    transform: [{ scale: 0.6 + pulse.value * 1.9 }],
  }));

  return (
    <View style={styles.statusInner}>
      <View style={styles.nfcStage}>
        <Animated.View style={[styles.pulseRing, ring2]} />
        <Animated.View style={[styles.pulseRing, ring1]} />
        <MetalChip size={84} tone="graphite">
          <Nfc size={28} color="#F5F6F9" strokeWidth={1.6} />
        </MetalChip>
      </View>
      <Text style={[styles.statusTitle, { marginTop: space.xl }]}>Hold Near Reader</Text>
      <Text style={styles.statusSub}>NFC 태그에 가까이 대주세요</Text>
    </View>
  );
};

const Quoting: React.FC = () => (
  <View style={styles.statusInner}>
    <View style={styles.nfcStage}>
      <MetalChip size={84} tone="graphite">
        <ActivityIndicator color="#F5F6F9" size="small" />
      </MetalChip>
    </View>
    <Text style={[styles.statusTitle, { marginTop: space.xl }]}>환율 확인 중</Text>
    <Text style={styles.statusSub}>XRPL DEX에서 최적 경로 탐색</Text>
  </View>
);

// USD → KRW 환전 단계 — 실제 견적 숫자로 시각화. 화살표가 좌우로 펄스.
const Exchanging: React.FC<{ krwAmount: number; usdAmount: number; rate: number }> = ({
  krwAmount,
  usdAmount,
  rate,
}) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [t]);
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (t.value - 0.5) * 14 }],
    opacity: 0.55 + t.value * 0.45,
  }));
  return (
    <View style={styles.statusInner}>
      <View style={styles.fxRow}>
        <View style={styles.fxPill}>
          <Text style={styles.fxCcy}>USD</Text>
          <Text style={styles.fxAmt}>{formatAmount(usdAmount, 'USD')}</Text>
        </View>
        <Animated.View style={arrowStyle}>
          <ArrowRightLeft size={26} color={colors.primary} strokeWidth={2.4} />
        </Animated.View>
        <View style={styles.fxPill}>
          <Text style={styles.fxCcy}>KRW</Text>
          <Text style={styles.fxAmt}>{formatAmount(krwAmount, 'KRW')}</Text>
        </View>
      </View>
      <Text style={[styles.statusTitle, { marginTop: space.xl }]}>환전 중…</Text>
      <Text style={styles.statusSub}>
        달러를 원화로 자동 환전 · 1 USD = ₩{rate ? rate.toFixed(0) : '—'}
      </Text>
    </View>
  );
};

const Submitting: React.FC<{ krwAmount: number; usdAmount: number }> = ({
  krwAmount,
  usdAmount,
}) => (
  <View style={styles.statusInner}>
    <Text style={styles.bigKrw}>{formatAmount(krwAmount, 'KRW')}</Text>
    <Text style={styles.approxUsd}>≈ {formatAmount(usdAmount, 'USD')}</Text>
    <View style={styles.submittingRow}>
      <ActivityIndicator color={colors.text} size="small" />
      <Text style={styles.submittingText}>XRPL에 결제 전송 중…</Text>
    </View>
  </View>
);

const SuccessHeader: React.FC = () => {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(
      80,
      withTiming(1, { duration: 380, easing: Easing.out(Easing.back(1.6)) }),
    );
  }, [scale]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.statusInner}>
      <Animated.View style={animStyle}>
        <MetalChip size={84} tone="silver">
          <Check size={32} color="#0A0B0E" strokeWidth={2.6} />
        </MetalChip>
      </Animated.View>
      <Text style={[styles.statusTitle, { marginTop: space.xl }]}>결제 완료</Text>
    </View>
  );
};

const SuccessFooter: React.FC<{
  krwAmount: number;
  usdAmount: number;
  rate: number;
  hash: string;
}> = ({ krwAmount, usdAmount, rate, hash }) => (
  <View style={styles.successFooter}>
    <View style={styles.successRow}>
      <Text style={styles.successLabel}>결제 금액</Text>
      <Text style={styles.successValue}>{formatAmount(krwAmount, 'KRW')}</Text>
    </View>
    <View style={styles.successDivider} />
    <View style={styles.successRow}>
      <Text style={styles.successLabel}>USD 차감</Text>
      <Text style={styles.successValue}>{formatAmount(usdAmount, 'USD')}</Text>
    </View>
    <View style={styles.successDivider} />
    <View style={styles.successRow}>
      <Text style={styles.successLabel}>적용 환율</Text>
      <Text style={styles.successValue}>1 USD = ₩{rate.toFixed(2)}</Text>
    </View>
    <View style={styles.successDivider} />
    <Pressable
      onPress={() => {
        if (!/^[0-9A-F]{64}$/i.test(hash)) return; // mock 해시면 무시
        Linking.openURL(EXPLORER_BASE + hash);
      }}
      style={({ pressed }) => [styles.successRow, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.successLabel}>Tx Hash</Text>
      <Text style={styles.successHash}>
        {hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash}
      </Text>
    </Pressable>
  </View>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <View style={styles.statusInner}>
    <Text style={styles.statusTitle}>결제 실패</Text>
    <Text style={styles.statusSub}>{message || '잠시 후 다시 시도해주세요'}</Text>
    <Pressable onPress={onRetry} style={styles.retry}>
      <Text style={styles.retryText}>다시 시도</Text>
    </Pressable>
  </View>
);

// ─── styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#06070A',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArea: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
  },
  statusArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  statusInner: {
    alignItems: 'center',
  },
  statusTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: space.lg,
  },
  statusSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: space.xs,
  },

  // NFC 무대 — 메탈 칩 + 펄스 ring들이 그 주위에 발산
  nfcStage: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  // 환전 단계 — USD ↔ KRW 칩 + 화살표
  fxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
  },
  fxPill: {
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
    minWidth: 110,
  },
  fxCcy: {
    color: 'rgba(140,185,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 3,
  },
  fxAmt: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // 결제 진행 중 큰 금액 표시
  bigKrw: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  approxUsd: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
    marginTop: space.xs,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xl,
  },
  submittingText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  successFooter: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: space.lg,
    marginBottom: space.lg,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.md,
  },
  successLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
  successValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  successHash: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Menlo',
  },
  successDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Error
  retry: {
    marginTop: space.xl,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  retryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
