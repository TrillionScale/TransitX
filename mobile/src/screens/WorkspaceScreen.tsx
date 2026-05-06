import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ChevronLeft, Plus, UserPlus, Users, Wallet } from 'lucide-react-native';

import { MemberCard } from '../components/MemberCard';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { WalletPanel } from '../components/WalletPanel';
import { GroupsPanel } from '../components/GroupsPanel';
import { useCards } from '../state/useCards';
import { useGroup } from '../state/useGroup';
import { Card } from '../types';
import { RootStackParamList } from '../navigation';
import { accentForCard, colors, motion, radius, space } from '../theme';
import { Screen, IconButton, ColorPill, Glass } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Workspace'>;
type Selection = 'wallet' | 'groups' | string;

export const WorkspaceScreen: React.FC<Props> = ({ navigation }) => {
  const { cards, loading } = useCards();
  const [selection, setSelection] = useState<Selection>('wallet');
  const [showCreate, setShowCreate] = useState(false);
  const insets = useSafeAreaInsets();

  const groups = cards.filter((c) => c.kind === 'group');
  const activeGroup =
    selection !== 'wallet' && selection !== 'groups'
      ? cards.find((c) => c.id === selection)
      : null;

  // 메뉴 indicator 위치/높이 추적 — 각 항목 onLayout에서 위치 저장
  const positions = useRef<Record<string, { y: number; h: number }>>({});
  const indicatorY = useSharedValue(0);
  const indicatorH = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  const measureItem = (key: string) => (e: { nativeEvent: { layout: { y: number; height: number } } }) => {
    const { y, height } = e.nativeEvent.layout;
    positions.current[key] = { y, h: height };
    if (selection === key) {
      indicatorY.value = withSpring(y, { damping: 18, stiffness: 180 });
      indicatorH.value = withSpring(height, { damping: 18, stiffness: 180 });
      indicatorOpacity.value = withSpring(1);
    }
  };

  // selection 바뀌면 indicator 이동
  useEffect(() => {
    const pos = positions.current[selection];
    if (pos) {
      indicatorY.value = withSpring(pos.y, { damping: 18, stiffness: 180 });
      indicatorH.value = withSpring(pos.h, { damping: 18, stiffness: 180 });
      indicatorOpacity.value = withSpring(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: indicatorY.value }],
    height: indicatorH.value,
    opacity: indicatorOpacity.value,
  }));

  return (
    <Screen edges={[]} noEnter>
      <View style={styles.container}>
        {/* ─── Sidebar — 글래스 패널 ─── */}
        <View style={styles.sidebar}>
          <BlurView
            intensity={28}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}
          />
          {/* 우측 hairline */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: 1,
              backgroundColor: 'rgba(255,255,255,0.4)',
            }}
          />
          <View style={[styles.sidebarTop, { paddingTop: insets.top + space.md }]}>
            <IconButton
              icon={ChevronLeft}
              size="sm"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.brand}>
              <Text style={styles.brandStar}>✳</Text> TransitX
            </Text>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.sidebarScroll}
              contentContainerStyle={[
                styles.sidebarScrollContent,
                { paddingBottom: insets.bottom + space.xl },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* 슬라이딩 indicator — 헤더 캡슐과 같은 단순 라이트 글래스 */}
              <Animated.View style={[styles.indicatorPlate, indicatorStyle]}>
                <View style={styles.indicatorCapsule}>
                  <BlurView
                    intensity={30}
                    tint="light"
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.sm }]}
                  />
                  <View pointerEvents="none" style={styles.indicatorTint} />
                  <View pointerEvents="none" style={styles.indicatorBorder} />
                  <View pointerEvents="none" style={styles.indicatorHair} />
                </View>
              </Animated.View>

              <View onLayout={measureItem('wallet')}>
                <SidebarTopItem
                  icon={Wallet}
                  label="내 지갑"
                  active={selection === 'wallet'}
                  onPress={() => setSelection('wallet')}
                />
              </View>
              <View onLayout={measureItem('groups')}>
                <SidebarTopItem
                  icon={Users}
                  label="그룹 관리"
                  active={selection === 'groups'}
                  onPress={() => setSelection('groups')}
                />
              </View>

              {groups.map((g) => (
                <View key={g.id} onLayout={measureItem(g.id)} style={styles.subItemWrap}>
                  <SidebarSubItem
                    card={g}
                    active={selection === g.id}
                    onPress={() => setSelection(g.id)}
                  />
                </View>
              ))}

              <Pressable
                style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.6 }]}
                onPress={() => setShowCreate(true)}
              >
                <View style={styles.addIcon}>
                  <Plus size={12} color={colors.textFaint} strokeWidth={2} />
                </View>
                <Text style={styles.addText}>그룹 추가</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>

        {/* ─── Main content ─── */}
        <View style={[styles.main, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={{ flex: 1 }}>
            {selection === 'wallet' ? (
              <WalletPanel />
            ) : selection === 'groups' ? (
              <GroupsPanel onSelect={setSelection} />
            ) : activeGroup ? (
              <GroupContent card={activeGroup} />
            ) : (
              <View style={styles.center}>
                <Text style={styles.empty}>그룹을 선택하세요</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <CreateGroupModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(group) => {
          setShowCreate(false);
          setSelection(group.address);
        }}
      />
    </Screen>
  );
};

// ─── Sidebar items ───────────────────────────────────────────────

type IconCmp = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

const SidebarTopItem: React.FC<{
  icon: IconCmp;
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.item,
      active && styles.itemActive,
      pressed && !active && { backgroundColor: colors.surfaceFaint },
    ]}
  >
    <Text style={[styles.itemLabel, active && styles.itemLabelActive]} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const SidebarSubItem: React.FC<{ card: Card; active: boolean; onPress: () => void }> = ({
  card,
  active,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.subItem,
      active && styles.itemActive,
      pressed && !active && { backgroundColor: colors.surfaceFaint },
    ]}
  >
    <Text style={[styles.subLabel, active && styles.subLabelActive]} numberOfLines={1}>
      {card.name}
    </Text>
  </Pressable>
);

// ─── Group content ──────────────────────────────────────────────

const GroupContent: React.FC<{ card: Card }> = ({ card }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { group, loading, addMember } = useGroup(card.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAddMember, setShowAddMember] = useState(false);

  const SCREEN_W = Dimensions.get('window').width;
  const CONTENT_W = SCREEN_W - 132;

  if (loading || !group) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.groupRoot}>
      <View style={styles.groupHeader}>
        <View style={styles.groupAdminBadge}>
          {/* 프로필 칩 — 카드 패턴 (가운데 투명, 가장자리 컬러) */}
          <ColorPill size={28} accent={colors.primary} radius={14}>
            <Text style={styles.groupAdminText}>Z</Text>
          </ColorPill>
          <Text style={styles.groupAdminLabel}>관리자 모드</Text>
        </View>
        <Pressable
          onPress={() => setShowAddMember(true)}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <ColorPill accent={colors.primary} paddingH={12} paddingV={6} radius={999}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <UserPlus size={14} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.addMemberText}>멤버 추가</Text>
            </View>
          </ColorPill>
        </Pressable>
      </View>

      <View style={styles.groupTitleBlock}>
        <Text style={styles.groupKicker}>Group</Text>
        <Text style={styles.groupTitle} numberOfLines={2}>
          {group.name}
        </Text>
        <Text style={styles.groupSub}>
          {group.members.length}명 · 활성{' '}
          {group.members.filter((m) => m.status === 'active').length}명
        </Text>
      </View>

      <View style={styles.carouselWrap}>
        <Carousel
          loop={false}
          width={CONTENT_W}
          height={260}
          data={group.members}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
            parallaxAdjacentItemScale: 0.78,
          }}
          onSnapToItem={setActiveIndex}
          renderItem={({ item }) => (
            <View style={styles.carouselSlot}>
              <MemberCard
                member={item}
                onPress={() =>
                  navigation.navigate('MemberDetail', {
                    groupId: card.id,
                    memberAddr: item.address,
                  })
                }
              />
            </View>
          )}
        />

        <View style={styles.dots}>
          {group.members.map((m, i) => (
            <View
              key={m.address}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <AddMemberModal
        visible={showAddMember}
        groupId={card.id}
        onClose={() => setShowAddMember(false)}
        onAdd={async (_, addr, alias) => {
          await addMember(addr, alias);
        }}
      />
    </View>
  );
};

const SIDEBAR_W = 132;

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: SIDEBAR_W,
    overflow: 'hidden',
  },
  sidebarTop: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.md,
  },
  brand: {
    color: colors.textOnLight,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  brandStar: { color: colors.primary },
  sidebarScroll: { flex: 1 },
  sidebarScrollContent: {
    paddingHorizontal: space.sm,
    paddingBottom: space.xl,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    marginVertical: 1,
    position: 'relative',
  },
  // 활성 항목 자체 배경은 indicator가 처리 — 여기는 무력화
  itemActive: {},
  // 슬라이딩 indicator — 사방 파란 그림자 + 안쪽 effect layer
  indicatorPlate: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderRadius: radius.sm,
    shadowColor: '#3B5DCC',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  indicatorCapsule: {
    flex: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  indicatorTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderRadius: radius.sm,
  },
  indicatorBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  indicatorHair: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  itemDot: {
    width: 16,
    height: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    color: colors.textOnLightMuted,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  itemLabelActive: {
    color: '#0A0E1A',
    fontWeight: '700',
    textShadowColor: 'rgba(59,93,204,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },

  subItemWrap: {
    paddingLeft: space.md,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    marginVertical: 1,
    position: 'relative',
  },
  subDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  subLabel: {
    flex: 1,
    color: colors.textOnLightFaint,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  subLabelActive: {
    color: '#0A0E1A',
    fontWeight: '700',
    textShadowColor: 'rgba(59,93,204,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    marginTop: space.sm,
  },
  addIcon: {
    width: 16,
    height: 16,
    borderRadius: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
  },
  addText: {
    color: colors.textOnLightFaint,
    fontSize: 11,
    fontWeight: '500',
  },

  main: { flex: 1 },

  // Group content
  groupRoot: { flex: 1, paddingTop: space.lg },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  groupAdminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  groupAdminAvatar: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  groupAdminText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  groupAdminLabel: {
    color: colors.textOnLight,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  groupTitleBlock: {
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  groupKicker: {
    color: colors.textOnLightFaint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: space.xs,
  },
  groupTitle: {
    color: colors.textOnLight,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 32,
    marginBottom: space.xs,
  },
  groupSub: {
    color: colors.textOnLightMuted,
    fontSize: 13,
    fontWeight: '500',
  },

  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  addMemberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  carouselWrap: {
    flex: 1,
    alignItems: 'center',
  },
  carouselSlot: {
    flex: 1,
    paddingHorizontal: space.sm,
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginTop: space.md,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(14,17,22,0.18)',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 14,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xl,
  },
  empty: {
    color: colors.textOnLightMuted,
    fontSize: 14,
  },
});
