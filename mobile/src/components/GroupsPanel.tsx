import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Plus, Users } from 'lucide-react-native';

import { CardItem } from './CardItem';
import { CreateGroupModal } from './CreateGroupModal';
import { useCards } from '../state/useCards';
import { useGroup } from '../state/useGroup';
import { Card } from '../types';
import { colors, radius, space } from '../theme';
import { useDynamicColors } from '../state/useThemeMode';
import { DarkGlass, EmptyState } from './ui';

type Props = {
  onSelect: (groupId: string) => void;
};

export const GroupsPanel: React.FC<Props> = ({ onSelect }) => {
  const { cards, loading } = useCards();
  const [showCreate, setShowCreate] = useState(false);
  const dyn = useDynamicColors();

  const groups = cards.filter((c) => c.kind === 'group');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: dyn.textOnLight }]}>그룹 관리</Text>
        <Text style={[styles.sub, { color: dyn.textOnLightMuted }]}>
          {groups.length === 0
            ? '아직 그룹이 없습니다'
            : `내가 관리하는 그룹 ${groups.length}개`}
        </Text>
      </View>

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="그룹 카드를 만들어보세요"
          message={'가족·회사·관광 가이드를 위한\n공용 카드. 멤버에게 권한만 주면 끝.'}
          cta={{ label: '그룹 만들기', icon: Plus, onPress: () => setShowCreate(true) }}
        />
      ) : (
        <>
          {groups.map((g) => (
            <GroupSummaryCard key={g.id} card={g} onPress={() => onSelect(g.id)} />
          ))}

          <Pressable
            onPress={() => setShowCreate(true)}
            style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.addIconWrap}>
              <Plus size={18} color={colors.textMuted} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addTitle, { color: dyn.textOnLight }]}>새 그룹 만들기</Text>
              <Text style={[styles.addSub, { color: dyn.textOnLightMuted }]}>
                회사·가족 등 공용 결제 카드
              </Text>
            </View>
          </Pressable>
        </>
      )}

      <CreateGroupModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(group) => {
          setShowCreate(false);
          onSelect(group.address);
        }}
      />
    </ScrollView>
  );
};

const GroupSummaryCard: React.FC<{ card: Card; onPress: () => void }> = ({ card, onPress }) => {
  const { group } = useGroup(card.id);
  const memberCount = group?.members.length ?? 0;
  const activeCount = group?.members.filter((m) => m.status === 'active').length ?? 0;

  return (
    <View style={styles.summaryWrap}>
      <CardItem card={card} onPress={onPress} />
      <DarkGlass radius="md" style={styles.summaryMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>멤버</Text>
          <Text style={styles.metaValue}>{memberCount}명</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>활성</Text>
          <Text style={styles.metaValue}>{activeCount}명</Text>
        </View>
      </DarkGlass>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xxl * 2,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { marginBottom: space.lg },
  title: {
    color: colors.textOnLight,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  sub: {
    color: colors.textOnLightMuted,
    fontSize: 13,
    fontWeight: '500',
  },

  summaryWrap: {
    marginBottom: space.md,
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.lg,
    marginTop: -8,
    marginHorizontal: space.md,
    zIndex: -1,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: space.xs,
  },
  metaLabel: {
    color: colors.textOnGlassFaint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.textOnGlass,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  metaDivider: {
    width: StyleSheet.hairlineWidth,
    height: 16,
    backgroundColor: colors.border,
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: radius.lg,
    padding: space.lg,
    marginTop: space.sm,
    borderWidth: 1,
    borderColor: 'rgba(14,17,22,0.12)',
    borderStyle: 'dashed',
  },
  addIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTitle: {
    color: colors.textOnLight,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  addSub: {
    color: colors.textOnLightMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
