import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Snowflake, Activity } from 'lucide-react-native';
import { Member } from '../types';
import { accentForCard, radius, space } from '../theme';
import { shortAddr, formatAmount } from '../format';
import { useThemeMode } from '../state/useThemeMode';

type Props = {
  member: Member;
  onPress?: () => void;
  variant?: 'slider' | 'large';
};

const hexToRgba = (hex: string, alpha: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`;
};

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(seed)}&size=200&backgroundColor=transparent`;

// ISO 신용카드 비율 (85.6 × 54mm = 1.586:1)
const CARD_RATIO = 1.586;

export const MemberCard: React.FC<Props> = ({ member, onPress }) => {
  const accent = accentForCard(member.address);
  const isFrozen = member.status === 'frozen';
  const isActive = !isFrozen && member.spentTodayKrw > 0;
  const hasLimit = member.dailyLimitKrw > 0;
  const limitPct = hasLimit ? Math.min(member.spentTodayKrw / member.dailyLimitKrw, 1) : 0;
  const isOverLimit = hasLimit && member.spentTodayKrw >= member.dailyLimitKrw;
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  const accentMid  = hexToRgba(accent, 0.80);
  const accentFade = hexToRgba(accent, 0.0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          shadowColor: accent,
          shadowOpacity: isDark ? 0.45 : 0.50,
          shadowRadius: isDark ? 18 : 24,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={styles.surface}>

        {/* ── 배경 ── */}
        <LinearGradient
          colors={['#0E1228', '#080C1C', '#04080E']}
          start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Accent tint overlay — 다크모드에선 채도 더 강하게 */}
        <LinearGradient
          colors={[
            hexToRgba(accent, isDark ? 0.85 : 0.22),
            hexToRgba(accent, isDark ? 0.55 : 0.06),
            hexToRgba(accent, isDark ? 0.30 : 0),
          ]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Edge glows */}
        <LinearGradient pointerEvents="none" colors={[accentMid, accentFade]} locations={[0, 1]}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={[styles.edge, { top: 0, left: 0, right: 0, height: 40 }]} />
        <LinearGradient pointerEvents="none" colors={[accentFade, accentMid]} locations={[0, 1]}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={[styles.edge, { bottom: 0, left: 0, right: 0, height: 36 }]} />
        <LinearGradient pointerEvents="none" colors={[accentMid, accentFade]} locations={[0, 1]}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={[styles.edge, { top: 0, bottom: 0, left: 0, width: 40 }]} />
        <LinearGradient pointerEvents="none" colors={[accentFade, accentMid]} locations={[0, 1]}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={[styles.edge, { top: 0, bottom: 0, right: 0, width: 40 }]} />

        {/* Top hairline */}
        <LinearGradient
          colors={['transparent', hexToRgba(accent, 0.65), 'transparent']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={styles.hairline}
          pointerEvents="none"
        />
        {/* Card border */}
        <View pointerEvents="none" style={[styles.cardBorder, { borderColor: hexToRgba(accent, 0.22) }]} />

        {/* ── 콘텐츠 ── */}
        <View style={styles.content}>

          {/* Top row: MEMBER chip + status badge */}
          <View style={styles.topRow}>
            <View
              style={[
                styles.kindChip,
                isDark
                  ? { borderColor: hexToRgba(accent, 0.55), backgroundColor: 'rgba(8,12,24,0.85)' }
                  : { borderColor: hexToRgba(accent, 0.50), backgroundColor: hexToRgba(accent, 0.12) },
              ]}
            >
              <Text style={[styles.kindText, { color: accent }]}>MEMBER</Text>
            </View>
            {isFrozen ? (
              <View
                style={[
                  styles.frozenChip,
                  isDark && { backgroundColor: 'rgba(8,12,24,0.85)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(136,204,255,0.5)' },
                ]}
              >
                <Snowflake size={8} color="#88CCFF" strokeWidth={2.5} />
                <Text style={styles.frozenText}>FROZEN</Text>
              </View>
            ) : isActive ? (
              <View
                style={[
                  styles.activeChip,
                  isDark && { backgroundColor: 'rgba(8,12,24,0.85)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(94,231,168,0.5)' },
                ]}
              >
                <View style={styles.activePulse} />
                <Activity size={8} color="#5EE7A8" strokeWidth={2.5} />
                <Text style={styles.activeText}>사용중</Text>
              </View>
            ) : null}
          </View>

          {/* Middle row: avatar + info */}
          <View style={styles.midRow}>
            {/* Avatar */}
            <View style={[styles.avatarOuterGlow, { shadowColor: accent, shadowOpacity: 0.65, shadowRadius: 14, shadowOffset: { width: 0, height: 3 } }]}>
              <View style={styles.avatarRing}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.88)', hexToRgba(accent, 0.85), hexToRgba(accent, 0.30), 'rgba(255,255,255,0.10)']}
                  locations={[0, 0.3, 0.7, 1]}
                  start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.avatarInner}>
                  <Image source={{ uri: avatarUrl(member.address) }} style={styles.avatarImg} />
                  <LinearGradient
                    colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.08)', 'transparent', 'rgba(0,0,0,0.08)']}
                    locations={[0, 0.25, 0.55, 1]}
                    start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                </View>
              </View>
            </View>

            {/* Info column */}
            <View style={styles.infoCol}>
              <Text style={styles.alias} numberOfLines={1}>{member.alias}</Text>
              <Text style={styles.addr}>{shortAddr(member.address)}</Text>
            </View>

            {/* TX watermark top-right */}
            <Text style={[styles.txMark, { color: hexToRgba(accent, 0.18) }]}>TX</Text>
          </View>

          {/* Bottom row: limit bar */}
          {hasLimit ? (
            <View style={styles.limitSection}>
              <View style={styles.limitBar}>
                <LinearGradient
                  colors={isOverLimit ? ['#FF6B6B', '#FF4040'] : [accent, hexToRgba(accent, 0.55)]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.limitFill, { width: `${limitPct * 100}%` as any }]}
                />
              </View>
              <View style={styles.limitMeta}>
                <Text style={[styles.limitText, isOverLimit && { color: '#FF8A8A' }]}>
                  {formatAmount(member.spentTodayKrw, 'KRW')}
                </Text>
                <Text style={styles.limitMax}>/ {formatAmount(member.dailyLimitKrw, 'KRW')}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.limitSection}>
              <Text style={styles.noLimit}>한도 미설정</Text>
            </View>
          )}

        </View>
      </View>
    </Pressable>
  );
};

const AVATAR = 58;

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    width: '100%',
  },
  surface: {
    borderRadius: radius.xl,
    aspectRatio: CARD_RATIO,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  edge: { position: 'absolute' },
  hairline: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    borderWidth: 1,
  },

  // ── 콘텐츠 레이아웃 ────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kindChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  kindText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  frozenChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(100,180,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(100,180,255,0.30)',
  },
  frozenText: { color: '#88CCFF', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(94,231,168,0.12)',
    borderWidth: 1, borderColor: 'rgba(94,231,168,0.35)',
  },
  activePulse: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#5EE7A8',
    shadowColor: '#5EE7A8', shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 },
  },
  activeText: { color: '#5EE7A8', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },

  // Middle row
  midRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarOuterGlow: { borderRadius: 999 },
  avatarRing: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    padding: 2.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,30,60,0.50)',
  },
  avatarImg: { width: '100%', height: '100%' },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  alias: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  addr: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
    fontFamily: 'Menlo',
    letterSpacing: 0.3,
  },
  txMark: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: 'Unbounded-Black',
    alignSelf: 'flex-start',
  },

  // Bottom row
  limitSection: {
    gap: 4,
  },
  limitBar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  limitFill: {
    height: '100%',
    borderRadius: 2,
  },
  limitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  limitText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '700',
  },
  limitMax: {
    color: 'rgba(255,255,255,0.30)',
    fontSize: 10,
    fontWeight: '500',
  },
  noLimit: {
    color: 'rgba(255,255,255,0.22)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
