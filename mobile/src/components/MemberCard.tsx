import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Snowflake } from 'lucide-react-native';
import { Member } from '../types';
import { accentForCard, colors, radius, space } from '../theme';
import { shortAddr } from '../format';

type Props = {
  member: Member;
  onPress?: () => void;
  variant?: 'slider' | 'large';
};

const darken = (hex: string, amount = 0.78): string => {
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

const EDGE = 60;

export const MemberCard: React.FC<Props> = ({ member, onPress, variant = 'slider' }) => {
  const accent = accentForCard(member.address);
  const initial = member.alias.replace(/[^가-힣A-Za-z]/g, '')[0] ?? '?';
  const isFrozen = member.status === 'frozen';
  const isLarge = variant === 'large';

  // 가운데 투명, 가장자리 inner glow
  const glow = hexToRgba(accent, 0.95);
  const glowFaint = hexToRgba(accent, 0.0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          shadowColor: accent,
          shadowOpacity: 0.55,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 0 },
          elevation: 10,
        },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View
        style={[
          styles.surface,
          isLarge && styles.surfaceLarge,
          { backgroundColor: 'transparent' },
        ]}
      >
        {/* Inner glow 4 edges — 가장자리 빛, 안쪽 투명 */}
        <LinearGradient
          pointerEvents="none"
          colors={[glow, glowFaint]}
          locations={[0, 0.85]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.edge, { top: 0, left: 0, right: 0, height: EDGE }]}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[glowFaint, glow]}
          locations={[0.15, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.edge, { bottom: 0, left: 0, right: 0, height: EDGE }]}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[glow, glowFaint]}
          locations={[0, 0.85]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.edge, { top: 0, bottom: 0, left: 0, width: EDGE }]}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[glowFaint, glow]}
          locations={[0.15, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.edge, { top: 0, bottom: 0, right: 0, width: EDGE }]}
        />
        <View pointerEvents="none" style={styles.hairline} />

        {/* Content */}
        <View style={[styles.content, isLarge && styles.contentLarge]}>
          <View style={styles.topRow}>
            <View style={styles.kindChip}>
              <Text style={styles.kindText}>MEMBER</Text>
            </View>
            {isFrozen && (
              <View style={styles.frozenChip}>
                <Snowflake size={11} color={colors.textOnCard} strokeWidth={2.2} />
                <Text style={styles.frozenText}>FROZEN</Text>
              </View>
            )}
          </View>

          <View style={styles.avatarWrap}>
            <Text style={[styles.avatarText, isLarge && styles.avatarTextLarge]}>
              {initial}
            </Text>
          </View>

          <View style={styles.bottomBlock}>
            <Text style={[styles.alias, isLarge && styles.aliasLarge]} numberOfLines={1}>
              {member.alias}
            </Text>
            <View style={styles.metaRow}>
              <MapPin size={11} color={colors.textOnCard} strokeWidth={1.8} opacity={0.7} />
              <Text style={styles.addr}>{shortAddr(member.address)}</Text>
            </View>
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
  surface: {
    borderRadius: radius.xl,
    aspectRatio: 1,
    overflow: 'hidden',
  },
  surfaceLarge: {
    aspectRatio: 1,
  },
  edge: { position: 'absolute' },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },

  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    justifyContent: 'space-between',
  },
  contentLarge: {
    paddingHorizontal: space.xl,
    paddingVertical: space.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kindChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  kindText: {
    color: colors.textOnCard,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  frozenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  frozenText: {
    color: colors.textOnCard,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  avatarWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textOnCard,
    fontSize: 86,
    fontWeight: '800',
    letterSpacing: -2,
    opacity: 0.92,
  },
  avatarTextLarge: {
    fontSize: 110,
  },
  bottomBlock: { gap: 4 },
  alias: {
    color: colors.textOnCard,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  aliasLarge: {
    fontSize: 26,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addr: {
    color: colors.textOnCard,
    opacity: 0.7,
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Menlo',
    letterSpacing: 0.4,
  },
});
