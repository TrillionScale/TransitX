import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft, ShieldCheck, ShieldAlert, Camera,
  Globe, CreditCard, Zap, Moon, Sun, ChevronRight,
  Users, Copy, Wifi, WifiOff,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { RootStackParamList } from '../navigation';
import { colors, radius, space } from '../theme';
import { useWallet } from '../state/useWallet';
import { useTxHistory } from '../state/useTxHistory';
import { isIdentityVerified, clearIdentityVerification } from '../state/useIdentity';
import { useThemeMode } from '../state/useThemeMode';
import { Screen, ScreenHeader, IconButton, DarkGlass } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(seed)}&size=200&backgroundColor=transparent`;
const shortAddr = (a: string) => (a.length <= 12 ? a : `${a.slice(0, 6)}…${a.slice(-6)}`);

const TRANSIT = [
  { flag: '🇰🇷', name: 'T-money',  active: true  },
  { flag: '🇯🇵', name: 'Suica',    active: true  },
  { flag: '🇬🇧', name: 'Oyster',   active: true  },
  { flag: '🇺🇸', name: 'OMNY',     active: false },
  { flag: '🇸🇬', name: 'EZ-Link',  active: true  },
  { flag: '🇫🇷', name: 'Navigo',   active: false },
  { flag: '🇦🇺', name: 'Opal',     active: true  },
  { flag: '🇩🇪', name: 'BVG',      active: false },
  { flag: '🇭🇰', name: 'Octopus',  active: true  },
  { flag: '🇨🇳', name: 'Metro',    active: false },
];

type IC = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
const StatCard: React.FC<{ icon: IC; value: string; label: string; color: string }> = ({
  icon: Icon, value, label, color,
}) => (
  <DarkGlass radius="lg" style={styles.statCard}>
    <View style={[styles.statIconWrap, { backgroundColor: color + '22' }]}>
      <Icon size={16} color={color} strokeWidth={2} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </DarkGlass>
);

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { wallet } = useWallet();
  const { txs } = useTxHistory(wallet?.address ?? '');
  const { mode, toggle } = useThemeMode();
  const insets = useSafeAreaInsets();
  const [verified, setVerified] = useState(false);

  useEffect(() => { isIdentityVerified().then(setVerified); }, []);

  const totalSpentUsd = txs.reduce((s, t) => s + t.amountUsd, 0);
  const activeNets = TRANSIT.filter(n => n.active).length;

  const copyAddr = async () => {
    if (!wallet) return;
    await Clipboard.setStringAsync(wallet.address);
    Alert.alert('복사됨', '지갑 주소가 클립보드에 복사되었습니다');
  };

  const reVerify = () =>
    Alert.alert('신원 재인증', '기존 인증이 초기화됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '재인증',
        onPress: async () => {
          await clearIdentityVerification();
          setVerified(false);
          navigation.navigate('FaceVerify', { force: true });
        },
      },
    ]);

  return (
    <Screen>
      <ScreenHeader
        title="내 정보"
        left={<IconButton icon={ChevronLeft} onPress={() => navigation.goBack()} />}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── 프로필 헤더 ── */}
        <View style={styles.hero}>
          <View style={styles.avatarShell}>
            <LinearGradient
              colors={['rgba(255,255,255,0.90)', '#7B95F4', '#3B5DCC', 'rgba(255,255,255,0.15)']}
              locations={[0, 0.28, 0.72, 1]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.avatarInner}>
              {wallet && (
                <Image source={{ uri: avatarUrl(wallet.address) }} style={styles.avatarImg} />
              )}
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'transparent', 'rgba(0,0,0,0.1)']}
                locations={[0, 0.5, 1]}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </View>
          </View>
          <Text style={styles.heroName}>내 지갑</Text>
          <Pressable style={styles.addrRow} onPress={copyAddr}>
            <Text style={styles.heroAddr}>{wallet ? shortAddr(wallet.address) : '---'}</Text>
            <Copy size={12} color="rgba(255,255,255,0.35)" strokeWidth={2} />
          </Pressable>
          <View style={styles.balancePill}>
            <LinearGradient
              colors={['rgba(59,93,204,0.40)', 'rgba(59,93,204,0.18)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
            />
            <Text style={styles.balancePillText}>
              $ {wallet ? wallet.balanceUsd.toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>

        {/* ── 신원 인증 카드 ── */}
        <View style={styles.section}>
          <DarkGlass radius="lg" style={styles.verifyCard}>
            <LinearGradient
              colors={verified
                ? ['rgba(94,231,168,0.12)', 'transparent']
                : ['rgba(244,197,107,0.14)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
              pointerEvents="none"
            />
            <View style={styles.verifyRow}>
              <View style={[styles.verifyIconWrap, {
                backgroundColor: verified ? 'rgba(94,231,168,0.15)' : 'rgba(244,197,107,0.15)',
                borderColor: verified ? 'rgba(94,231,168,0.30)' : 'rgba(244,197,107,0.30)',
              }]}>
                {verified
                  ? <ShieldCheck size={24} color="#5EE7A8" strokeWidth={1.8} />
                  : <ShieldAlert size={24} color="#F4C56B" strokeWidth={1.8} />}
              </View>
              <View style={styles.verifyInfo}>
                <Text style={styles.verifyTitle}>
                  {verified ? '얼굴 인증 완료' : '신원 미인증'}
                </Text>
                <Text style={styles.verifySub}>
                  {verified ? '카메라 얼굴 인식 본인 확인됨' : '카메라로 신원을 인증해주세요'}
                </Text>
              </View>
              <Pressable
                onPress={verified ? reVerify : () => navigation.navigate('FaceVerify', { force: true })}
                style={({ pressed }) => [styles.reVerifyBtn, pressed && { opacity: 0.75 }]}
              >
                <Camera size={14} color={colors.primary} strokeWidth={2} />
                <Text style={styles.reVerifyText}>{verified ? '재인증' : '인증하기'}</Text>
              </Pressable>
            </View>
          </DarkGlass>
        </View>

        {/* ── 이용 통계 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>이용 현황</Text>
          <View style={styles.statsGrid}>
            <StatCard icon={Globe}       value="42"                          label="이용 국가"  color="#7B95F4" />
            <StatCard icon={CreditCard}  value={String(txs.length)}          label="총 결제"    color="#5EE7A8" />
            <StatCard icon={Zap}         value={`$${totalSpentUsd.toFixed(0)}`} label="총 사용" color="#F4C56B" />
          </View>
        </View>

        {/* ── 교통 네트워크 ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>교통 네트워크</Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>{activeNets}개 활성</Text>
            </View>
          </View>
          <DarkGlass radius="lg" style={styles.networkCard}>
            <View style={styles.networkGrid}>
              {TRANSIT.map(({ flag, name, active }) => (
                <View key={name} style={[styles.networkItem, !active && styles.networkItemOff]}>
                  {active
                    ? <Wifi size={9} color="#5EE7A8" strokeWidth={2} />
                    : <WifiOff size={9} color="rgba(255,255,255,0.18)" strokeWidth={2} />}
                  <Text style={styles.networkFlag}>{flag}</Text>
                  <Text style={[styles.networkName, !active && styles.networkNameOff]}>{name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.networkFooter}>
              <View style={styles.networkPulse} />
              <Text style={styles.networkFooterText}>
                자동 감지 · 국경 없는 즉시 결제
              </Text>
            </View>
          </DarkGlass>
        </View>

        {/* ── 앱 설정 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>앱 설정</Text>
          <DarkGlass radius="lg" style={styles.settingsCard}>
            <Pressable
              onPress={toggle}
              style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.7 }]}
            >
              {mode === 'dark'
                ? <Moon size={18} color="#F4C56B" strokeWidth={1.8} />
                : <Sun size={18} color="#F4C56B" strokeWidth={1.8} />}
              <Text style={styles.settingsLabel}>화면 테마</Text>
              <View style={styles.toggleChip}>
                <Text style={styles.toggleChipText}>{mode === 'dark' ? '다크' : '라이트'}</Text>
              </View>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.7 }]}
              onPress={() => navigation.navigate('Workspace', {})}
            >
              <Users size={18} color="#7B95F4" strokeWidth={1.8} />
              <Text style={styles.settingsLabel}>그룹 카드 관리</Text>
              <ChevronRight size={14} color="rgba(255,255,255,0.25)" strokeWidth={2} />
            </Pressable>
          </DarkGlass>
        </View>

        {/* ── 앱 정보 ── */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>TransitX v1.0.0</Text>
          <Text style={styles.appTagline}>국경 없는 이동 · 결제 · 초고속 환전</Text>
        </View>

      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },

  // ── 프로필 헤더 ────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: space.lg,
    paddingBottom: space.xl,
    gap: space.sm,
  },
  avatarShell: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
    overflow: 'hidden',
    shadowColor: '#3B5DCC',
    shadowOpacity: 0.65,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,30,60,0.5)',
  },
  avatarImg: { width: '100%', height: '100%' },
  heroName: {
    color: colors.textOnGlass,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroAddr: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 12,
    fontFamily: 'Menlo',
    letterSpacing: 0.4,
  },
  balancePill: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(123,149,244,0.30)',
  },
  balancePillText: {
    color: '#A0B8FF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // ── 섹션 ───────────────────────────────────────────────────────
  section: {
    paddingHorizontal: space.lg,
    marginTop: space.lg,
    gap: space.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(94,231,168,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(94,231,168,0.25)',
  },
  activeDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: '#5EE7A8',
    shadowColor: '#5EE7A8', shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 },
  },
  activeBadgeText: { color: '#5EE7A8', fontSize: 10, fontWeight: '700' },

  // ── 인증 카드 ───────────────────────────────────────────────────
  verifyCard: {
    padding: space.lg,
    overflow: 'hidden',
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  verifyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  verifyInfo: { flex: 1, minWidth: 0 },
  verifyTitle: {
    color: colors.textOnGlass,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  verifySub: {
    color: colors.textOnGlassFaint,
    fontSize: 11,
    fontWeight: '500',
  },
  reVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(59,127,255,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(59,127,255,0.28)',
  },
  reVerifyText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  // ── 통계 ────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    gap: space.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // ── 교통 네트워크 ────────────────────────────────────────────────
  networkCard: {
    padding: space.lg,
    gap: space.md,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(94,231,168,0.20)',
  },
  networkItemOff: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  networkFlag: { fontSize: 13 },
  networkName: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 11,
    fontWeight: '600',
  },
  networkNameOff: { color: 'rgba(255,255,255,0.25)' },
  networkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  networkPulse: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#5EE7A8',
    shadowColor: '#5EE7A8', shadowOpacity: 0.9, shadowRadius: 5, shadowOffset: { width: 0, height: 0 },
  },
  networkFooterText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '500',
  },

  // ── 설정 ────────────────────────────────────────────────────────
  settingsCard: { overflow: 'hidden' },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
  },
  settingsLabel: {
    flex: 1,
    color: colors.textOnGlass,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleChip: {
    backgroundColor: 'rgba(244,197,107,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(244,197,107,0.30)',
  },
  toggleChipText: { color: '#F4C56B', fontSize: 11, fontWeight: '700' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: space.lg,
  },

  // ── 앱 정보 ────────────────────────────────────────────────────
  appInfo: {
    alignItems: 'center',
    paddingTop: space.xl,
    gap: 4,
  },
  appVersion: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    fontWeight: '600',
  },
  appTagline: {
    color: 'rgba(255,255,255,0.18)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
