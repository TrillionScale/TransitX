import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import { ArrowLeft, ArrowDownUp, CheckCircle, RefreshCw } from 'lucide-react-native';

import { RootStackParamList } from '../navigation';
import { colors, radius, space } from '../theme';
import { formatAmount } from '../format';
import {
  getWalletBalances,
  quoteExchange,
  executeExchange,
  type ExchangeDir,
  type ExchangeQuote,
} from '../data/xrplClient';

type Props = NativeStackScreenProps<RootStackParamList, 'Exchange'>;

type Phase = 'idle' | 'quoting' | 'confirm' | 'sending' | 'success' | 'error';

const EXPLORER = 'https://testnet.xrpl.org/transactions/';

export const ExchangeScreen: React.FC<Props> = ({ navigation }) => {
  const [dir, setDir] = useState<ExchangeDir>('USD_TO_KRW');
  const [amountInput, setAmountInput] = useState(''); // 받을 통화 기준 수량
  const [phase, setPhase] = useState<Phase>('idle');
  const [bal, setBal] = useState<{ usd: number; krw: number; rate: number } | null>(null);
  const [quote, setQuote] = useState<ExchangeQuote | null>(null);
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const recvCcy = dir === 'USD_TO_KRW' ? 'KRW' : 'USD';
  const payCcy = dir === 'USD_TO_KRW' ? 'USD' : 'KRW';

  const loadBalances = useCallback(async () => {
    try {
      const b = await getWalletBalances();
      setBal({ usd: b.usd, krw: b.krw, rate: b.rate });
    } catch {
      /* ignore — 잔액 표시는 보조 */
    }
  }, []);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const handleQuote = useCallback(async () => {
    const recv = parseFloat(amountInput.replace(/,/g, ''));
    if (!recv || recv <= 0) {
      Alert.alert('금액 오류', `받을 ${recvCcy} 수량을 입력해주세요`);
      return;
    }
    setPhase('quoting');
    try {
      const q = await quoteExchange(dir, recv);
      setQuote(q);
      setPhase('confirm');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '환율 조회 실패');
      setPhase('error');
    }
  }, [amountInput, dir, recvCcy]);

  const handleExchange = useCallback(async () => {
    if (!quote) return;
    setPhase('sending');
    try {
      const r = await executeExchange(quote);
      setTxHash(r.hash);
      await loadBalances();
      setPhase('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '환전 실패');
      setPhase('error');
    }
  }, [quote, loadBalances]);

  const swapDir = () => {
    setDir((d) => (d === 'USD_TO_KRW' ? 'KRW_TO_USD' : 'USD_TO_KRW'));
    setAmountInput('');
    setQuote(null);
    setPhase('idle');
  };

  const reset = () => {
    setAmountInput('');
    setQuote(null);
    setTxHash('');
    setErrorMsg('');
    setPhase('idle');
  };

  const payBalance = bal ? (payCcy === 'USD' ? bal.usd : bal.krw) : 0;
  const insufficient = quote ? payBalance < quote.payValue : false;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Pressable hitSlop={12} style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>환전</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* 잔고 요약 */}
          <View style={styles.balCard}>
            <View style={styles.balRow}>
              <Text style={styles.balLabel}>USD 잔고</Text>
              <Text style={styles.balValue}>{bal ? formatAmount(bal.usd, 'USD') : '—'}</Text>
            </View>
            <View style={styles.balDivider} />
            <View style={styles.balRow}>
              <Text style={styles.balLabel}>KRW 잔고</Text>
              <Text style={styles.balValue}>{bal ? formatAmount(bal.krw, 'KRW') : '—'}</Text>
            </View>
          </View>

          {(phase === 'idle' || phase === 'quoting') && (
            <View style={styles.formCard}>
              <Text style={styles.dirLabel}>
                {payCcy} → {recvCcy}
              </Text>
              <Pressable style={styles.swapBtn} onPress={swapDir} hitSlop={8}>
                <ArrowDownUp size={16} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.swapText}>방향 바꾸기</Text>
              </Pressable>

              <Text style={[styles.sectionLabel, { marginTop: space.lg }]}>받을 금액 ({recvCcy})</Text>
              <View style={styles.amountRow}>
                <Text style={styles.currency}>{recvCcy === 'USD' ? '$' : '₩'}</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={recvCcy === 'USD' ? '100.00' : '100,000'}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={amountInput}
                  onChangeText={setAmountInput}
                  keyboardType="decimal-pad"
                />
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

          {phase === 'confirm' && quote && (
            <View style={styles.formCard}>
              <Text style={styles.confirmTitle}>환전 내역 확인</Text>
              <Row
                label="지불"
                value={formatAmount(quote.payValue, payCcy as 'USD' | 'KRW')}
              />
              <Divider />
              <Row label="받음" value={formatAmount(quote.receiveValue, recvCcy as 'USD' | 'KRW')} highlight />
              <Divider />
              <Row
                label="적용 환율"
                value={
                  dir === 'USD_TO_KRW'
                    ? `1 USD = ₩${(1 / quote.rate).toFixed(2)}`
                    : `1 USD = ₩${quote.rate.toFixed(2)}`
                }
              />
              <Divider />
              <Row label="경로" value="XRPL DEX (자가 결제)" />
              <Divider />
              <Row label="네트워크" value="XRPL Testnet" />

              {insufficient && <Text style={styles.warningText}>⚠ {payCcy} 잔고 부족</Text>}

              <View style={styles.confirmBtns}>
                <Pressable style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.6 }]} onPress={reset}>
                  <Text style={styles.ghostBtnText}>취소</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { flex: 1 },
                    pressed && { opacity: 0.8 },
                    insufficient && styles.primaryBtnDisabled,
                  ]}
                  onPress={handleExchange}
                  disabled={insufficient}
                >
                  <Text style={styles.primaryBtnText}>환전하기</Text>
                </Pressable>
              </View>
            </View>
          )}

          {phase === 'sending' && (
            <View style={styles.stateCard}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.stateTitle}>XRPL DEX에서 환전 중…</Text>
              <Text style={styles.stateSub}>주문 체결을 기다립니다 (3–5초)</Text>
            </View>
          )}

          {phase === 'success' && quote && (
            <View style={styles.stateCard}>
              <CheckCircle size={64} color={colors.success} strokeWidth={1.5} />
              <Text style={[styles.stateTitle, { color: colors.success }]}>환전 완료!</Text>
              <Text style={styles.stateSub}>
                {formatAmount(quote.payValue, payCcy as 'USD' | 'KRW')} →{' '}
                {formatAmount(quote.receiveValue, recvCcy as 'USD' | 'KRW')}
              </Text>
              <Pressable
                style={styles.hashCard}
                onPress={() => /^[0-9A-F]{64}$/i.test(txHash) && Linking.openURL(EXPLORER + txHash)}
              >
                <Text style={styles.hashLabel}>Tx Hash (탭하면 Explorer)</Text>
                <Text style={styles.hashValue} selectable>
                  {txHash.slice(0, 12)}…{txHash.slice(-8)}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { marginTop: space.xl }, pressed && { opacity: 0.8 }]}
                onPress={reset}
              >
                <Text style={styles.primaryBtnText}>다시 환전</Text>
              </Pressable>
            </View>
          )}

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

const Row: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <View style={row.container}>
    <Text style={row.label}>{label}</Text>
    <Text style={[row.value, highlight && row.highlight]}>{value}</Text>
  </View>
);
const Divider: React.FC = () => (
  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.10)' }} />
);
const row = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  label: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '500' },
  value: { color: '#F5F6F9', fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  highlight: { color: colors.primary, fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
});

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
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: colors.text, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  scroll: { padding: space.lg, gap: space.lg },
  balCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: space.lg,
  },
  balRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space.md },
  balLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '500' },
  balValue: { color: '#F5F6F9', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  balDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.10)' },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: space.lg,
  },
  dirLabel: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  swapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm },
  swapText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: { color: 'rgba(255,255,255,0.70)', fontSize: 15, fontWeight: '600' },
  confirmTitle: { color: colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: space.md },
  confirmBtns: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  warningText: { color: '#F4A95B', fontSize: 13, fontWeight: '600', marginTop: space.sm, textAlign: 'center' },
  stateCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    gap: space.md,
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
});
