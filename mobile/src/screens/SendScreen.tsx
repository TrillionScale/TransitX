import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, ArrowRight, CheckCircle, Send, RefreshCw } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { RootStackParamList } from '../navigation';
import { colors, font, radius, space } from '../theme';
import {
  getOrCreateWallet,
  getXrpKrwRate,
  getXrpBalance,
  sendXrpPayment,
} from '../data/xrplClient';

type Props = NativeStackScreenProps<RootStackParamList, 'Send'>;

type Phase = 'form' | 'quoting' | 'confirm' | 'sending' | 'success' | 'error';

const EXPLORER = 'https://testnet.xrpl.org/transactions/';

export const SendScreen: React.FC<Props> = ({ navigation }) => {
  const [phase, setPhase] = useState<Phase>('form');
  const [toAddress, setToAddress] = useState('');
  const [krwInput, setKrwInput] = useState('');
  const [rate, setRate]   = useState<number | null>(null);
  const [xrpAmount, setXrpAmount] = useState<number | null>(null);
  const [drops, setDrops] = useState<string | null>(null);
  const [myAddress, setMyAddress] = useState('');
  const [myXrp, setMyXrp] = useState<number | null>(null);
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 환율 조회 + 견적
  const handleQuote = useCallback(async () => {
    const krw = parseInt(krwInput.replace(/,/g, ''), 10);
    if (!krw || krw < 100) {
      Alert.alert('금액 오류', '100원 이상 입력해주세요');
      return;
    }
    if (!toAddress.startsWith('r') || toAddress.length < 25) {
      Alert.alert('주소 오류', '올바른 XRPL 주소를 입력해주세요 (r로 시작)');
      return;
    }
    setPhase('quoting');
    try {
      const [wallet, liveRate] = await Promise.all([
        getOrCreateWallet(),
        getXrpKrwRate(),
      ]);
      const xrp = (krw / liveRate) * 1.005;
      const d = Math.ceil(xrp * 1_000_000).toString();
      const bal = await getXrpBalance(wallet.address);

      setMyAddress(wallet.address);
      setMyXrp(bal);
      setRate(liveRate);
      setXrpAmount(xrp);
      setDrops(d);
      setPhase('confirm');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '환율 조회 실패');
      setPhase('error');
    }
  }, [krwInput, toAddress]);

  // 실제 송금
  const handleSend = useCallback(async () => {
    if (!drops) return;
    setPhase('sending');
    try {
      const wallet = await getOrCreateWallet();
      const result = await sendXrpPayment(wallet, toAddress, drops);
      setTxHash(result.hash);
      setPhase('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '송금 실패');
      setPhase('error');
    }
  }, [drops, toAddress]);

  const reset = () => {
    setPhase('form');
    setToAddress('');
    setKrwInput('');
    setRate(null);
    setXrpAmount(null);
    setDrops(null);
    setTxHash('');
    setErrorMsg('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable
            hitSlop={12}
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>XRP 송금</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 입력 폼 ── */}
          {(phase === 'form' || phase === 'quoting') && (
            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>받는 주소</Text>
              <TextInput
                style={styles.input}
                placeholder="rXXXXXXXXXXXXXXXXXXXX…"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={toAddress}
                onChangeText={setToAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={[styles.sectionLabel, { marginTop: space.lg }]}>금액 (KRW)</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="1,500"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={krwInput}
                  onChangeText={setKrwInput}
                  keyboardType="numeric"
                />
                <Text style={styles.currency}>₩</Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && { opacity: 0.8 },
                  phase === 'quoting' && styles.primaryBtnDisabled,
                ]}
                onPress={handleQuote}
                disabled={phase === 'quoting'}
              >
                {phase === 'quoting' ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>환율 확인</Text>
                    <RefreshCw size={16} color="#000" strokeWidth={2.2} />
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* ── 견적 확인 ── */}
          {phase === 'confirm' && rate && xrpAmount && (
            <View style={styles.formCard}>
              <Text style={styles.confirmTitle}>송금 내역 확인</Text>

              <Row label="받는 주소" value={`${toAddress.slice(0,8)}…${toAddress.slice(-6)}`} mono />
              <Divider />
              <Row label="송금 금액" value={`₩${Number(krwInput.replace(/,/g,'')).toLocaleString()}`} />
              <Divider />
              <Row
                label="≈ XRP"
                value={`${xrpAmount.toFixed(4)} XRP`}
                highlight
              />
              <Divider />
              <Row label="실시간 환율" value={`1 XRP = ₩${rate.toLocaleString(undefined,{maximumFractionDigits:0})}`} />
              <Divider />
              <Row label="내 잔고" value={`${(myXrp ?? 0).toFixed(4)} XRP`} />
              <Divider />
              <Row label="네트워크" value="XRPL Testnet" />

              {myXrp !== null && myXrp < xrpAmount && (
                <Text style={styles.warningText}>⚠ 잔고 부족 — 충전 후 다시 시도하세요</Text>
              )}

              <View style={styles.confirmBtns}>
                <Pressable
                  style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.6 }]}
                  onPress={reset}
                >
                  <Text style={styles.ghostBtnText}>취소</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { flex: 1 },
                    pressed && { opacity: 0.8 },
                    (myXrp !== null && myXrp < xrpAmount) && styles.primaryBtnDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={myXrp !== null && myXrp < xrpAmount}
                >
                  <Text style={styles.primaryBtnText}>송금하기</Text>
                  <Send size={16} color="#000" strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
          )}

          {/* ── 처리 중 ── */}
          {phase === 'sending' && (
            <View style={styles.stateCard}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.stateTitle}>XRPL에 제출 중…</Text>
              <Text style={styles.stateSub}>블록 컨펌을 기다립니다 (3–5초)</Text>
            </View>
          )}

          {/* ── 성공 ── */}
          {phase === 'success' && (
            <View style={styles.stateCard}>
              <CheckCircle size={64} color={colors.success} strokeWidth={1.5} />
              <Text style={[styles.stateTitle, { color: colors.success }]}>송금 완료!</Text>
              <Text style={styles.stateSub}>
                {xrpAmount?.toFixed(4)} XRP → {toAddress.slice(0,8)}…
              </Text>

              <View style={styles.hashCard}>
                <Text style={styles.hashLabel}>Tx Hash</Text>
                <Text style={styles.hashValue} selectable>
                  {txHash.slice(0,12)}…{txHash.slice(-8)}
                </Text>
              </View>

              <Text style={styles.explorerHint}>
                testnet.xrpl.org 에서 확인 가능
              </Text>

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { marginTop: space.xl }, pressed && { opacity: 0.8 }]}
                onPress={reset}
              >
                <Text style={styles.primaryBtnText}>다시 송금</Text>
              </Pressable>
            </View>
          )}

          {/* ── 에러 ── */}
          {phase === 'error' && (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>오류 발생</Text>
              <Text style={styles.stateSub}>{errorMsg}</Text>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { marginTop: space.xl }, pressed && { opacity: 0.8 }]}
                onPress={reset}
              >
                <Text style={styles.primaryBtnText}>다시 시도</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── 공통 서브컴포넌트 ────────────────────────────────────────────

const Row: React.FC<{ label: string; value: string; mono?: boolean; highlight?: boolean }> = ({
  label, value, mono, highlight,
}) => (
  <View style={row.container}>
    <Text style={row.label}>{label}</Text>
    <Text style={[row.value, mono && row.mono, highlight && row.highlight]}>{value}</Text>
  </View>
);

const Divider: React.FC = () => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.10)' }} />;

const row = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  label:     { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '500' },
  value:     { color: '#F5F6F9', fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  mono:      { fontFamily: 'Menlo', fontSize: 12 },
  highlight: { color: colors.primary, fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
});

// ─── 스타일 ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06070A' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: colors.text, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },

  scroll: { padding: space.lg, gap: space.lg },

  formCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: space.lg,
  },

  sectionLabel: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    color: '#F5F6F9',
    fontSize: 15,
    fontFamily: 'Menlo',
    letterSpacing: 0.3,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  currency: { color: 'rgba(255,255,255,0.40)', fontSize: 22, fontWeight: '600' },

  primaryBtn: {
    marginTop: space.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },

  ghostBtn: {
    paddingVertical: 16,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  ghostBtnText: { color: 'rgba(255,255,255,0.70)', fontSize: 15, fontWeight: '600' },

  confirmTitle: { color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: space.md },
  confirmBtns: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },

  warningText: { color: '#F4A95B', fontSize: 13, fontWeight: '600', marginTop: space.sm, textAlign: 'center' },

  stateCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: space.xl, gap: space.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    minHeight: 340,
  },
  stateTitle: { color: colors.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  stateSub: { color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },

  hashCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    padding: space.md,
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  hashLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  hashValue: { color: colors.text, fontSize: 13, fontFamily: 'Menlo', letterSpacing: 0.4 },
  explorerHint: { color: 'rgba(255,255,255,0.30)', fontSize: 11, fontWeight: '500' },
});
