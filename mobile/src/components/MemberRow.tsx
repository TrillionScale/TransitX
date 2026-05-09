import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Member } from '../types';
import { accentForCard, colors, font, radius, space } from '../theme';
import { formatAmount, shortAddr } from '../format';

type Props = {
  member: Member;
  onPress?: () => void;
};

export const MemberRow: React.FC<Props> = ({ member, onPress }) => {
  const accent = accentForCard(member.address);
  const initial = member.alias.replace(/[^가-힣A-Za-z]/g, '')[0] ?? '?';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.avatar, { backgroundColor: accent }]}>
        <Text style={styles.avatarText}>{initial}</Text>
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
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 17,
    fontWeight: '700',
  },
  middle: {
    flex: 1,
  },
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
    backgroundColor: colors.surface,
  },
  frozenText: {
    color: colors.textMuted,
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
