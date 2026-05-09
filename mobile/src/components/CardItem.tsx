import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Nfc } from 'lucide-react-native';
import { Card } from '../types';
import { accentForCard, colors, font, radius, shadow, space } from '../theme';
import { formatAmount, shortAddr } from '../format';

type Props = {
  card: Card;
  onPress?: () => void;
  /** list = small landscape, large = bigger landscape, portrait = full-bleed vertical */
  variant?: 'list' | 'large' | 'portrait';
};

const darken = (hex: string, amount = 0.5): string => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const hexToRgba = (hex: string, alpha: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`;
};

/**
 * Inner glow card — Inner Shadow 레퍼런스 톤.
 * 외곽이 살짝 컬러 빛으로 빛나고 가운데는 어두워지는 효과.
 * 가장자리에 4방향 LinearGradient로 inner shadow를 흉내.
 */
export const CardItem: React.FC<Props> = ({ card, onPress, variant = 'list' }) => {
  const accent = card.kind === 'personal' ? colors.primary : accentForCard(card.id);
  const isLarge = variant === 'large';
  const isPortrait = variant === 'portrait';

  // 가운데는 투명 — 뒷 배경이 그대로 비침
  // 가장자리에서만 accent 컬러가 빛나는 inner glow ring
  const glow = hexToRgba(accent, 0.85);
  const glowFaint = hexToRgba(accent, 0.0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        isLarge && styles.wrapLarge,
        isPortrait && styles.wrapPortrait,
        // 카드 사방 컬러 글로우
        {
          shadowColor: accent,
          shadowOpacity: 0.55,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 0 },
          elevation: 10,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.surface,
          isLarge && styles.surfaceLarge,
          isPortrait && styles.surfacePortrait,
          // 가운데 투명 — 뒷 배경 그대로 비침
          { backgroundColor: 'transparent' },
        ]}
      >
        {/* 카드 안쪽 블러 — 뒷 배경/워드마크가 살짝 흐려져 보임 */}
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} pointerEvents="none" />

        {/* Inner glow stack — 가장자리에서만 빛, 안쪽은 빠르게 투명 */}
        {(() => {
          const edge = isPortrait ? 70 : 40;
          return (
            <>
              <LinearGradient
                pointerEvents="none"
                colors={[glow, glowFaint]}
                locations={[0, 0.85]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[styles.glowEdge, { top: 0, left: 0, right: 0, height: edge }]}
              />
              <LinearGradient
                pointerEvents="none"
                colors={[glowFaint, glow]}
                locations={[0.15, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[styles.glowEdge, { bottom: 0, left: 0, right: 0, height: edge }]}
              />
              <LinearGradient
                pointerEvents="none"
                colors={[glow, glowFaint]}
                locations={[0, 0.85]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.glowEdge, { top: 0, bottom: 0, left: 0, width: edge }]}
              />
              <LinearGradient
                pointerEvents="none"
                colors={[glowFaint, glow]}
                locations={[0.15, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.glowEdge, { top: 0, bottom: 0, right: 0, width: edge }]}
              />
            </>
          );
        })()}
        {/* 위쪽 1px hairline highlight (light from above) */}
        <View pointerEvents="none" style={styles.hairline} />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.chip}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
            </View>
            <Nfc size={20} color={colors.textOnCard} strokeWidth={1.6} opacity={0.85} />
          </View>

          <View style={styles.middle}>
            <Text style={styles.label}>
              {card.kind === 'group' ? 'Group Card' : 'Personal'}
            </Text>
            <Text style={styles.name} numberOfLines={1}>
              {card.name}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balance}>{formatAmount(card.balanceUsd, 'USD')}</Text>
            </View>
            <Text style={styles.addr}>{shortAddr(card.address)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
  },
  wrapLarge: {
    borderRadius: radius.xl,
  },
  wrapPortrait: {
    flex: 1,
    borderRadius: 36,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
  surface: {
    borderRadius: radius.xl,
    height: 198,
    overflow: 'hidden',
  },
  surfaceLarge: {
    height: 230,
  },
  surfacePortrait: {
    flex: 1,
    height: undefined,
    borderRadius: 36,
  },
  glowEdge: {
    position: 'absolute',
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: space.xl,
    paddingVertical: space.xl,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chip: {
    width: 30,
    height: 22,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
  },
  middle: {
    marginTop: space.md,
  },
  label: {
    color: colors.textOnCard,
    opacity: 0.7,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  name: {
    color: colors.textOnCard,
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  balanceLabel: {
    color: colors.textOnCard,
    opacity: 0.55,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  balance: {
    color: colors.textOnCard,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  addr: {
    color: colors.textOnCard,
    opacity: 0.5,
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});

void font;
