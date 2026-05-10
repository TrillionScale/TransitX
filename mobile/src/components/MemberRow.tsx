import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Member } from '../types';
import { accentForCard, colors, radius, space } from '../theme';
import { formatAmount, shortAddr } from '../format';

type Props = {
  member: Member;
  onPress?: () => void;
};

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(seed)}&size=88&backgroundColor=transparent`;

export const MemberRow: React.FC<Props> = ({ member, onPress }) => {
  const accent = accentForCard(member.address);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {/* 아바타 */}
      <View style={[styles.avatarWrap, { borderColor: accent + '55' }]}>
        <Image
          source={{ uri: avatarUrl(member.address) }}
          style={styles.avatarImg}
        />
        {/* accent 링 빛 */}
        <View style={[StyleSheet.absoluteFill, styles.avatarOverlay, { backgroundColor: accent + '12' }]} />
        {/* active/frozen 상태 도트 */}
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: member.status === 'frozen' ? '#5BB8FF' : colors.success,
              borderColor: colors.bg,
            },
          ]}
        />
      </View>

      <View style={styles.middle}>
        <View style={styles.aliasRow}>
          <Text style={styles.alias} numberOfLines={1}>
            {member.alias}
          </Text>
          {member.status === 'frozen' && (
            <View style={styles.frozenBadge}>
              <Text style={styles.frozenText}>FROZEN</Text>
            </View>
          )}
        </View>
        <Text style={styles.sub} numberOfLines={1}>
          {shortAddr(member.address)}
          {member.dailyLimitKrw > 0 ? ` · 일 한도 ${formatAmount(member.dailyLimitKrw, 'KRW')}` : ''}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.spent}>{formatAmount(member.spentTodayKrw, 'KRW')}</Text>
        <ChevronRight size={16} color={colors.textFaint} strokeWidth={1.8} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    gap: space.md,
  },
  pressed: { opacity: 0.7 },

  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    borderRadius: 999,
  },
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },

  middle: { flex: 1 },
  aliasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: 2,
  },
  alias: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  frozenBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(100,180,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(100,180,255,0.30)',
  },
  frozenText: {
    color: '#88CCFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  spent: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
