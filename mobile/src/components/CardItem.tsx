import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi } from 'lucide-react-native';
import { Card } from '../types';
import { radius, space } from '../theme';
import { formatAmount } from '../format';

type Props = {
  card: Card;
  onPress?: () => void;
  /** credit: 표준 신용카드 가로 비율 (캐러셀용)
   *  portrait: 세로 긴 카드
   *  list: 작은 가로 카드 (리스트용) */
  variant?: 'list' | 'portrait' | 'credit';
};

const cardLast4 = (addr: string): string => {
  let h = 0;
  for (let i = 0; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) >>> 0;
  return String(h % 10000).padStart(4, '0');
};
const cardExpiry = (addr: string): string => {
  let h = 0;
  for (let i = 0; i < addr.length; i++) h = (h * 17 + addr.charCodeAt(i)) >>> 0;
  return `${String((h % 12) + 1).padStart(2, '0')}/${String(26 + (h % 4))}`;
};

export const CardItem: React.FC<Props> = ({ card, onPress, variant = 'list' }) => {
  const isCredit = variant === 'credit';
  const isPortrait = variant === 'portrait';
  const last4 = cardLast4(card.address);
  const expiry = cardExpiry(card.address);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        isPortrait ? styles.wrapPortrait : isCredit ? styles.wrapCredit : styles.wrap,
        {
          shadowColor: '#1A4ADF',
          shadowOpacity: 0.45,
          shadowRadius: 60,
          shadowOffset: { width: 0, height: 12 },
          elevation: 14,
        },
        pressed && { transform: [{ scale: 0.982 }], opacity: 0.93 },
      ]}
    >
      <View style={isPortrait ? styles.surfacePortrait : isCredit ? styles.surfaceCredit : styles.surface}>

        {/* ── LAYER 1: 다크 네이비 기본 ── */}
        <LinearGradient
          colors={['#060D3A', '#080F42', '#050C35', '#030820']}
          locations={[0, 0.3, 0.65, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* ── LAYER 2: 대각 블루 웨이브 ── */}
        <LinearGradient
          colors={[
            'rgba(25,95,255,0.78)',
            'rgba(35,115,255,0.52)',
            'rgba(28,90,230,0.22)',
            'transparent',
          ]}
          locations={[0, 0.30, 0.58, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0.72, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* ── LAYER 3: 웨이브 하이라이트 ── */}
        <LinearGradient
          colors={['transparent', 'rgba(80,160,255,0.18)', 'rgba(100,180,255,0.10)', 'transparent']}
          locations={[0, 0.25, 0.55, 1]}
          start={{ x: 0.05, y: 0.82 }}
          end={{ x: 0.62, y: 0.08 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* ── LAYER 4: 우상단 다크 오버레이 ── */}
        <LinearGradient
          colors={['rgba(4,8,28,0.82)', 'rgba(5,10,32,0.55)', 'transparent']}
          locations={[0, 0.38, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.18, y: 0.85 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* ── LAYER 5: 홀로그래픽 shimmer ── */}
        <LinearGradient
          colors={['transparent', 'rgba(100,180,255,0.06)', 'transparent']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 1, y: 0.6 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* ── 상단 hairline ── */}
        <LinearGradient
          colors={['rgba(80,140,255,0.0)', 'rgba(120,190,255,0.55)', 'rgba(80,140,255,0.0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.topHairline}
          pointerEvents="none"
        />

        {/* ── 카드 테두리 ── */}
        <View
          pointerEvents="none"
          style={[
            styles.border,
            (isPortrait || isCredit) && { borderRadius: 24, borderColor: 'rgba(100,160,255,0.20)' },
          ]}
        />

        {/* ══════════ CREDIT (표준 신용카드 가로) ══════════ */}
        {isCredit && (
          <View style={styles.contentCredit}>

            {/* ── 상단: 로고 + ZK 뱃지 ── */}
            <View style={styles.topRow}>
              <Text style={styles.logoText}>TransitX</Text>
              <View style={styles.zkBadge}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.zkText}>Powered by ZK Tech</Text>
              </View>
            </View>

            {/* ── 중앙: 칩+컨택리스 / 잔고 / 홀로그램 오브 ── */}
            <View style={styles.midCredit}>
              <View style={styles.chipAreaCredit}>
                <Chip />
                <View style={{ marginTop: 10 }}>
                  <Wifi size={20} color="rgba(180,215,255,0.58)" strokeWidth={1.3} />
                </View>
              </View>

              <View style={styles.balanceCenter}>
                <Text style={styles.balanceLabelC}>BALANCE</Text>
                <Text style={styles.balanceAmtC}>{formatAmount(card.balanceUsd, 'USD')}</Text>
              </View>

              <HoloOrb />
            </View>

            {/* ── 하단: 카드번호 / 홀더 + 유효기간 ── */}
            <View style={styles.bottomCredit}>
              <View style={styles.cardNumRowC}>
                {['••••', '••••', '••••', last4].map((g, i) => (
                  <Text key={i} style={[styles.cardNumC, i < 3 && styles.cardNumDotC]}>{g}</Text>
                ))}
              </View>
              <View style={styles.metaRowC}>
                <Text style={styles.cardHolderC} numberOfLines={1}>
                  {card.name.toUpperCase()}
                </Text>
                <View style={styles.expiryCol}>
                  <Text style={styles.metaLabelC}>VALID THRU</Text>
                  <Text style={styles.metaValC}>{expiry}</Text>
                </View>
              </View>
            </View>

          </View>
        )}

        {/* ══════════ PORTRAIT (세로 긴 카드) ══════════ */}
        {isPortrait && (
          <View style={styles.contentPortrait}>
            <View style={styles.topRow}>
              <Text style={styles.logoText}>TransitX</Text>
              <View style={styles.zkBadge}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.zkText}>Powered by ZK Tech</Text>
              </View>
            </View>
            <View style={styles.midPortrait}>
              <View style={styles.chipAreaPortrait}>
                <Chip />
                <View style={{ marginTop: 14 }}>
                  <Wifi size={24} color="rgba(180,215,255,0.60)" strokeWidth={1.3} />
                </View>
              </View>
              <HoloOrb />
            </View>
            <View style={styles.bottomPortrait}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabelP}>BALANCE</Text>
                <Text style={styles.balanceAmtP}>{formatAmount(card.balanceUsd, 'USD')}</Text>
              </View>
              <View style={styles.cardNumRow}>
                {['••••', '••••', '••••', last4].map((g, i) => (
                  <Text key={i} style={[styles.cardNumGroup, i < 3 && styles.cardNumDot]}>{g}</Text>
                ))}
              </View>
              <View style={styles.metaRow}>
                <View>
                  <Text style={styles.metaLabel}>VALID THRU</Text>
                  <Text style={styles.metaVal}>{expiry}</Text>
                </View>
                <Text style={styles.cardHolder} numberOfLines={1}>
                  {card.name.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ══════════ LIST (리스트 소형) ══════════ */}
        {!isCredit && !isPortrait && (
          <View style={styles.contentList}>
            <View style={styles.topRow}>
              <Text style={styles.logoTextSm}>TransitX</Text>
              <View style={styles.zkBadgeSm}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.zkTextSm}>ZK Tech</Text>
              </View>
            </View>
            <View style={styles.midList}>
              <Chip small />
              <HoloOrb />
            </View>
            <View style={styles.bottomList}>
              <View>
                <Text style={styles.metaLabel}>VALID THRU</Text>
                <Text style={styles.metaVal}>{expiry}</Text>
                <Text style={styles.cardHolder}>{card.name.toUpperCase()}</Text>
              </View>
              <View style={styles.cardNumRowSm}>
                {['••••', '••••', '••••', last4].map((g, i) => (
                  <Text key={i} style={[styles.cardNumGroupSm, i < 3 && styles.cardNumDotSm]}>{g}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

      </View>
    </Pressable>
  );
};

// ── EMV 칩 ─────────────────────────────────────────────────────────
const Chip: React.FC<{ small?: boolean }> = ({ small }) => (
  <View style={[styles.chip, small && styles.chipSm]}>
    <LinearGradient
      colors={['#D4AC48', '#F0D070', '#B8902E', '#E8C860', '#C09038']}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.chipH} />
    <View style={styles.chipH2} />
    <View style={styles.chipV} />
    <View style={styles.chipCenter} />
  </View>
);

// ── 홀로그램 오브 (실제 카드 홀로그램 스티커 느낌) ────────────────────
const HoloOrb: React.FC = () => (
  <View style={styles.holoWrap}>
    {/* 바깥 링 — 이리데슨트 그라디언트 */}
    <LinearGradient
      colors={['rgba(180,210,255,0.22)', 'rgba(160,120,255,0.18)', 'rgba(80,220,200,0.14)', 'rgba(255,200,120,0.10)']}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
    />
    {/* 상단 반사광 — 렌즈 플레어 */}
    <LinearGradient
      colors={['rgba(255,255,255,0.45)', 'rgba(200,230,255,0.15)', 'transparent']}
      locations={[0, 0.4, 1]}
      start={{ x: 0.25, y: 0 }}
      end={{ x: 0.75, y: 1 }}
      style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
      pointerEvents="none"
    />
    {/* 내부 그라디언트 */}
    <LinearGradient
      colors={['rgba(120,180,255,0.30)', 'rgba(100,100,255,0.15)', 'rgba(200,100,255,0.10)']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.holoInner, { borderRadius: 999 }]}
      pointerEvents="none"
    />
    {/* 테두리 링 */}
    <View pointerEvents="none" style={styles.holoBorder} />
    {/* 중앙 미세 하이라이트 */}
    <View pointerEvents="none" style={styles.holoDot} />
  </View>
);

const styles = StyleSheet.create({
  // ── 래퍼 ──────────────────────────────────────────────────────────
  wrap: { borderRadius: 20 },
  wrapCredit: { flex: 1, borderRadius: 24 },
  wrapPortrait: { flex: 1, borderRadius: 24 },

  surface: { borderRadius: 20, height: 205, overflow: 'hidden' },
  surfaceCredit: { flex: 1, borderRadius: 24, overflow: 'hidden' },
  surfacePortrait: { flex: 1, borderRadius: 24, overflow: 'hidden' },

  // ── 공통 장식 ──────────────────────────────────────────────────────
  topHairline: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(80,140,255,0.22)',
  },

  // ── 공통 상단 행 ───────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Unbounded-Black',
    fontSize: 13,
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  logoTextSm: {
    fontFamily: 'Unbounded-Black',
    fontSize: 9,
    letterSpacing: 0.1,
    color: '#FFFFFF',
  },
  zkBadge: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  zkText: {
    color: 'rgba(200,225,255,0.85)',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  zkBadgeSm: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  zkTextSm: {
    color: 'rgba(200,225,255,0.80)',
    fontSize: 7,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // ═══ CREDIT 레이아웃 ═══════════════════════════════════════════════
  contentCredit: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  midCredit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipAreaCredit: {
    alignItems: 'flex-start',
  },
  balanceCenter: {
    alignItems: 'center',
    gap: 2,
  },
  balanceLabelC: {
    color: 'rgba(140,185,255,0.58)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  balanceAmtC: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  bottomCredit: {
    gap: 6,
  },
  cardNumRowC: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardNumC: {
    color: '#FFFFFF',
    fontFamily: 'Menlo',
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: '600',
  },
  cardNumDotC: {
    color: 'rgba(180,215,255,0.38)',
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: '400',
  },
  metaRowC: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolderC: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    flex: 1,
  },
  expiryCol: {
    alignItems: 'flex-end',
  },
  metaLabelC: {
    color: 'rgba(140,185,255,0.50)',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  metaValC: {
    color: 'rgba(210,230,255,0.90)',
    fontFamily: 'Menlo',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: 1,
  },

  // ═══ PORTRAIT 레이아웃 ══════════════════════════════════════════════
  contentPortrait: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  midPortrait: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipAreaPortrait: { alignItems: 'flex-start' },
  bottomPortrait: { gap: 10 },
  balanceRow: { gap: 1 },
  balanceLabelP: {
    color: 'rgba(140,185,255,0.60)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
  balanceAmtP: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
  },
  cardNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardNumGroup: {
    color: '#FFFFFF',
    fontFamily: 'Menlo',
    fontSize: 15,
    letterSpacing: 2.2,
    fontWeight: '600',
  },
  cardNumDot: {
    color: 'rgba(180,215,255,0.38)',
    fontSize: 11,
    letterSpacing: 2.8,
    fontWeight: '400',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metaLabel: {
    color: 'rgba(140,185,255,0.50)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  metaVal: {
    color: 'rgba(210,230,255,0.90)',
    fontFamily: 'Menlo',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  cardHolder: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // ═══ LIST 레이아웃 ══════════════════════════════════════════════════
  contentList: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  midList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardNumRowSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardNumGroupSm: {
    color: '#FFFFFF',
    fontFamily: 'Menlo',
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '600',
  },
  cardNumDotSm: {
    color: 'rgba(180,215,255,0.36)',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '400',
  },

  // ── EMV 칩 ─────────────────────────────────────────────────────────
  chip: {
    width: 44,
    height: 34,
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(235,200,85,0.50)',
  },
  chipSm: { width: 34, height: 26, borderRadius: 5 },
  chipH: { position: 'absolute', top: '33%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(140,100,20,0.50)' },
  chipH2: { position: 'absolute', top: '66%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(140,100,20,0.50)' },
  chipV: { position: 'absolute', left: '45%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(140,100,20,0.50)' },
  chipCenter: {
    position: 'absolute',
    top: '20%', left: '20%', width: '60%', height: '60%',
    borderRadius: 3,
    backgroundColor: 'rgba(180,140,40,0.28)',
    borderWidth: 0.5,
    borderColor: 'rgba(210,165,65,0.38)',
  },

  // ── 홀로그램 오브 ───────────────────────────────────────────────────
  holoWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#A0C8FF',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  holoInner: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
  },
  holoBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(200,220,255,0.35)',
  },
  holoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
});
