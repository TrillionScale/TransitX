import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated as RNAnimated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ChevronLeft, CircleDot, Plus, UserPlus, Users, Wallet, PowerOff } from 'lucide-react-native';

import { MemberCard } from '../components/MemberCard';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { WalletPanel } from '../components/WalletPanel';
import { GroupsPanel } from '../components/GroupsPanel';
import { useCards } from '../state/useCards';
import { useGroup } from '../state/useGroup';
import { Card } from '../types';
import { RootStackParamList } from '../navigation';
import { accentForCard, colors, radius, space } from '../theme';
import { useDynamicColors, useThemeMode } from '../state/useThemeMode';
import { Screen, IconButton, ColorPill } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Workspace'>;
type Selection = 'wallet' | 'groups' | string;

export const WorkspaceScreen: React.FC<Props> = ({ navigation }) => {
  const { cards, loading } = useCards();
  const [selection, setSelection] = useState<Selection>('wallet');
  const [showCreate, setShowCreate] = useState(false);
  const insets = useSafeAreaInsets();
  const dyn = useDynamicColors();

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
            <Text style={[styles.brand, { color: dyn.textOnLight }]}>TransitX</Text>
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
                <Text style={[styles.addText, { color: dyn.textOnLightFaint }]}>그룹 추가</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>

        {/* ─── Main content ─── */}
        <View style={styles.main}>
          <View style={{ flex: 1 }}>
            {selection === 'wallet' ? (
              <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <WalletPanel />
              </View>
            ) : selection === 'groups' ? (
              <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <GroupsPanel onSelect={setSelection} />
              </View>
            ) : activeGroup ? (
              <GroupContent card={activeGroup} />
            ) : (
              <View
                style={[
                  styles.center,
                  { paddingTop: insets.top, paddingBottom: insets.bottom },
                ]}
              >
                <Text style={[styles.empty, { color: dyn.textOnLightMuted }]}>그룹을 선택하세요</Text>
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
}> = ({ icon: Icon, label, active, onPress }) => {
  const dyn = useDynamicColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        active && styles.itemActive,
        pressed && !active && { backgroundColor: colors.surfaceFaint },
      ]}
    >
      <Icon
        size={14}
        color={active ? dyn.textOnLight : dyn.textOnLightMuted}
        strokeWidth={active ? 2.2 : 1.8}
      />
      <Text
        style={[
          styles.itemLabel,
          { color: dyn.textOnLightMuted },
          active && [styles.itemLabelActive, { color: dyn.textOnLight }],
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const SidebarSubItem: React.FC<{ card: Card; active: boolean; onPress: () => void }> = ({
  card,
  active,
  onPress,
}) => {
  const accent = accentForCard(card.id);
  const dyn = useDynamicColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.subItem,
        active && styles.itemActive,
        pressed && !active && { backgroundColor: colors.surfaceFaint },
      ]}
    >
      <CircleDot size={11} color={accent} strokeWidth={2} />
      <Text
        style={[
          styles.subLabel,
          { color: dyn.textOnLightFaint },
          active && [styles.subLabelActive, { color: dyn.textOnLight }],
        ]}
        numberOfLines={1}
      >
        {card.name}
      </Text>
    </Pressable>
  );
};

// ─── Group content ──────────────────────────────────────────────

const GroupContent: React.FC<{ card: Card }> = ({ card }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { group, loading, addMember, freezeMember } = useGroup(card.id);
  const [showAddMember, setShowAddMember] = useState(false);
  const insets = useSafeAreaInsets();
  const [panelH, setPanelH] = useState(180);
  const dyn = useDynamicColors();
  const { mode } = useThemeMode();
  const { width: WIN_W, height: WIN_H } = useWindowDimensions();
  const isWide = WIN_W > 560;

  // ── 드래그 가능 "사용 종료" 플로팅 버튼 ──
  const floatPos = useRef(new RNAnimated.ValueXY({ x: WIN_W - SIDEBAR_W - 76, y: WIN_H - 210 })).current;
  const lastPos = useRef({ x: WIN_W - SIDEBAR_W - 76, y: WIN_H - 210 });
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = false;
        floatPos.setOffset({ x: lastPos.current.x, y: lastPos.current.y });
        floatPos.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4) isDragging.current = true;
        RNAnimated.event([null, { dx: floatPos.x, dy: floatPos.y }], { useNativeDriver: false })(_, gs);
      },
      onPanResponderRelease: (_, gs) => {
        floatPos.flattenOffset();
        lastPos.current = {
          x: lastPos.current.x + gs.dx,
          y: lastPos.current.y + gs.dy,
        };
        if (!isDragging.current && group) {
          const activeMembers = group.members.filter(
            (m) => m.status === 'active' && m.spentTodayKrw > 0,
          );
          if (activeMembers.length === 0) {
            Alert.alert('사용 종료', '현재 사용 중인 멤버가 없습니다.');
            return;
          }
          Alert.alert(
            '사용 종료',
            '결제 권한을 동결할 멤버를 선택하세요',
            [
              ...activeMembers.map((m) => ({
                text: m.alias,
                onPress: () => freezeMember(m.address),
              })),
              { text: '취소', style: 'cancel' as const },
            ],
          );
        }
      },
    }),
  ).current;
  const fadeColors: [string, string] =
    mode === 'dark'
      ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']
      : ['rgba(180,200,222,0)', 'rgba(180,200,222,0.85)'];

  if (loading || !group) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.groupRoot}>
      <View style={styles.groupBody}>
        <ScrollView
          contentContainerStyle={[
            styles.memberListContent,
            { paddingTop: panelH + space.md },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.memberGrid, isWide && styles.memberGridWide]}>
            {group.members.map((m) => (
              <View key={m.address} style={[styles.memberItem, isWide && styles.memberItemWide]}>
                <MemberCard
                  member={m}
                  onPress={() =>
                    navigation.navigate('MemberDetail', {
                      groupId: card.id,
                      memberAddr: m.address,
                    })
                  }
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 타이틀 글라스 판넬 — 관리자 줄 + 그룹 타이틀을 한 덩어리로 */}
        <View pointerEvents="box-none" style={styles.titleOverlay}>
          <View
            style={styles.titlePanelShadow}
            onLayout={(e) => setPanelH(e.nativeEvent.layout.height)}
          >
            {/* 글라스 효과 layer — 카메라섬까지 전체 덮음 */}
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.titlePanel]}>
              <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
              <View
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.28)' }]}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.titleTopHighlight}
              />
              <View style={styles.titleTopHair} />
              <View style={styles.titleBottomHair} />
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.titleFade}
              />
            </View>

            {/* 콘텐츠 — 안전영역 아래에서 시작 */}
            <View style={{ paddingTop: insets.top }}>
              {/* 관리자 줄 */}
              <View style={styles.groupHeader}>
                <View style={styles.groupAdminBadge}>
                  <ColorPill size={28} accent={colors.primary} radius={14}>
                    <Text style={styles.groupAdminText}>Z</Text>
                  </ColorPill>
                  <Text style={[styles.groupAdminLabel, { color: dyn.textOnLight }]}>관리자 모드</Text>
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

              {/* 타이틀 */}
              <View style={styles.groupTitleBlock}>
                <Text style={[styles.groupKicker, { color: dyn.textOnLightFaint }]}>Group</Text>
                <Text style={[styles.groupTitle, { color: dyn.textOnLight }]} numberOfLines={2}>
                  {group.name}
                </Text>
                <Text style={[styles.groupSub, { color: dyn.textOnLightMuted }]}>
                  {group.members.length}명 · 활성{' '}
                  {group.members.filter((m) => m.status === 'active').length}명
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 하단 fade — 스크롤 끝이 자연스럽게 사라짐 */}
        <LinearGradient
          pointerEvents="none"
          colors={fadeColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.bottomFade, { height: insets.bottom + 64 }]}
        />
      </View>

      {/* ── 드래그 가능 사용 종료 플로팅 버튼 ── */}
      <RNAnimated.View
        {...panResponder.panHandlers}
        style={[styles.floatBtn, { transform: floatPos.getTranslateTransform() }]}
      >
        <LinearGradient
          colors={['#3B2A4A', '#1E1030']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        />
        <View pointerEvents="none" style={styles.floatBtnBorder} />
        {group && group.members.some((m) => m.status === 'active' && m.spentTodayKrw > 0) && (
          <View style={styles.floatActiveDot} />
        )}
        <PowerOff size={18} color="#D4AAFF" strokeWidth={2} />
        <Text style={styles.floatBtnLabel}>사용 종료</Text>
      </RNAnimated.View>

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
  groupRoot: { flex: 1 },
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

  groupBody: {
    flex: 1,
  },
  titleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  titlePanelShadow: {
    shadowColor: '#3B5DCC',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  titlePanel: {
    overflow: 'hidden',
  },
  titleTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 22,
  },
  titleTopHair: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  titleBottomHair: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  titleFade: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
  },
  memberListContent: {
    paddingTop: 130,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl * 3,
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  memberGridWide: {
    gap: space.lg,
  },
  memberItem: {
    width: '100%',
  },
  memberItemWide: {
    width: '47%',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  // ── 드래그 플로팅 버튼 ──────────────────────────────────────────
  floatBtn: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#9B6DFF',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 14,
    overflow: 'hidden',
  },
  floatBtnBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(180,140,255,0.30)',
  },
  floatBtnLabel: {
    color: '#D4AAFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  floatActiveDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5EE7A8',
    shadowColor: '#5EE7A8',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
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
