import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Check, Pencil, Snowflake, UserMinus, Sun, X, AlertTriangle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';

import { TxRow } from '../components/TxRow';
import { MemberCard } from '../components/MemberCard';
import { useGroup } from '../state/useGroup';
import { useTxHistory } from '../state/useTxHistory';
import { RootStackParamList } from '../navigation';
import { colors, radius, space } from '../theme';
import { formatAmount } from '../format';
import { Screen, ScreenHeader, IconButton, DarkGlass, Section, Row, Button } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberDetail'>;

const shortAddr = (a: string) => (a.length <= 12 ? a : `${a.slice(0, 6)}…${a.slice(-6)}`);

const LIMIT_PRESETS = [
  { label: '무제한', value: 0 },
  { label: '₩10만', value: 100_000 },
  { label: '₩30만', value: 300_000 },
  { label: '₩50만', value: 500_000 },
  { label: '₩100만', value: 1_000_000 },
];

export const MemberDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId, memberAddr } = route.params;
  const { findMember, freezeMember, removeMember, updateMember } = useGroup(groupId);
  const { txs } = useTxHistory(groupId);

  const member = findMember(memberAddr);
  const [busy, setBusy] = useState<'freeze' | 'remove' | 'save' | null>(null);

  // 편집 모드
  const [editing, setEditing] = useState(false);
  const [editAlias, setEditAlias] = useState('');
  const [editLimit, setEditLimit] = useState(0);

  if (!member) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const isFrozen = member.status === 'frozen';
  const hasLimit = member.dailyLimitKrw > 0;
  const limitPct = hasLimit ? Math.min(member.spentTodayKrw / member.dailyLimitKrw, 1) : 0;
  const isOverLimit = hasLimit && member.spentTodayKrw >= member.dailyLimitKrw;
  const memberTxs = txs.filter((t) => t.signer === memberAddr);

  const startEdit = () => {
    setEditAlias(member.alias);
    setEditLimit(member.dailyLimitKrw);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    if (!editAlias.trim()) {
      Alert.alert('오류', '이름을 입력해주세요');
      return;
    }
    setBusy('save');
    try {
      await updateMember(memberAddr, {
        alias: editAlias.trim(),
        dailyLimitKrw: editLimit,
      });
      setEditing(false);
    } finally {
      setBusy(null);
    }
  };

  const handleFreeze = () => {
    Alert.alert(
      isFrozen ? '권한 해제' : '권한 동결',
      isFrozen
        ? `${member.alias} 님의 결제 권한을 다시 활성화할까요?`
        : `${member.alias} 님이 그룹 풀에서 결제하지 못하게 동결할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: isFrozen ? '해제' : '동결',
          style: isFrozen ? 'default' : 'destructive',
          onPress: async () => {
            setBusy('freeze');
            try { await freezeMember(memberAddr); } finally { setBusy(null); }
          },
        },
      ],
    );
  };

  const handleRemove = () => {
    Alert.alert('멤버 퇴장', `${member.alias} 님을 그룹에서 영구 제거합니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '퇴장',
        style: 'destructive',
        onPress: async () => {
          setBusy('remove');
          try {
            await removeMember(memberAddr);
            navigation.goBack();
          } finally { setBusy(null); }
        },
      },
    ]);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(member.address);
    Alert.alert('복사됨', '지갑 주소가 클립보드에 복사되었습니다');
  };

  return (
    <Screen>
      <ScreenHeader
        title="멤버 프로필"
        left={<IconButton icon={ChevronLeft} onPress={() => navigation.goBack()} />}
        right={
          editing
            ? (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <IconButton icon={X} onPress={cancelEdit} />
                <IconButton
                  icon={Check}
                  onPress={handleSave}
                />
              </View>
            )
            : <IconButton icon={Pencil} onPress={startEdit} />
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 액션 버튼 ── */}
          {!editing && (
            <View style={styles.actions}>
              <Button
                label={isFrozen ? '권한 해제' : '권한 동결'}
                icon={isFrozen ? Sun : Snowflake}
                variant="glass"
                loading={busy === 'freeze'}
                onPress={handleFreeze}
                style={{ flex: 1 }}
              />
              <Button
                label="퇴장"
                icon={UserMinus}
                variant="danger"
                loading={busy === 'remove'}
                onPress={handleRemove}
                style={{ flex: 1 }}
              />
            </View>
          )}

          {/* ── 프로필 카드 ── */}
          <View style={styles.heroWrap}>
            <MemberCard member={editing ? { ...member, alias: editAlias || member.alias } : member} variant="large" />
          </View>

          {/* ── 편집 모드 ── */}
          {editing ? (
            <View style={styles.editSection}>

              {/* 이름 편집 */}
              <DarkGlass radius="lg" style={styles.editCard}>
                <Text style={styles.editLabel}>이름</Text>
                <TextInput
                  style={styles.editInput}
                  value={editAlias}
                  onChangeText={setEditAlias}
                  placeholder="멤버 이름"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  maxLength={20}
                  autoFocus
                  selectionColor={colors.primary}
                />
              </DarkGlass>

              {/* 일 한도 편집 */}
              <DarkGlass radius="lg" style={styles.editCard}>
                <Text style={styles.editLabel}>일 한도</Text>
                <View style={styles.presetRow}>
                  {LIMIT_PRESETS.map((p) => {
                    const active = editLimit === p.value;
                    return (
                      <View key={p.value} style={styles.presetBtnWrap}>
                        {active && (
                          <LinearGradient
                            colors={['#3B7FFF', '#1F52E0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
                          />
                        )}
                        <Text
                          style={[styles.presetText, active && styles.presetTextActive]}
                          onPress={() => setEditLimit(p.value)}
                        >
                          {p.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.customLimitRow}>
                  <Text style={styles.editLabel}>직접 입력 (원)</Text>
                  <TextInput
                    style={[styles.editInput, styles.editInputSm]}
                    value={editLimit === 0 ? '' : String(editLimit)}
                    onChangeText={(v) => {
                      const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                      setEditLimit(isNaN(n) ? 0 : n);
                    }}
                    keyboardType="numeric"
                    placeholder="0 = 무제한"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    selectionColor={colors.primary}
                  />
                </View>
                <Text style={styles.limitPreview}>
                  {editLimit === 0 ? '무제한' : formatAmount(editLimit, 'KRW')}
                </Text>
              </DarkGlass>

              {/* 저장 버튼 */}
              <Button
                label="변경 사항 저장"
                icon={Check}
                variant="primary"
                loading={busy === 'save'}
                onPress={handleSave}
              />
            </View>
          ) : (
            <>
              {/* ── 정보 카드 ── */}
              <View style={styles.infoWrap}>
                <DarkGlass radius="lg" style={styles.infoCard}>
                  <Row label="지갑 주소" value={shortAddr(member.address)} onPress={handleCopy} showChevron />
                  <View style={styles.divider} />
                  <Row
                    label="일 한도"
                    value={member.dailyLimitKrw === 0 ? '무제한' : formatAmount(member.dailyLimitKrw, 'KRW')}
                  />
                  <View style={styles.divider} />
                  <Row label="오늘 사용" value={formatAmount(member.spentTodayKrw, 'KRW')}
                    rightSlot={isOverLimit ? <AlertTriangle size={13} color="#FF6B6B" strokeWidth={2} /> : undefined}
                  />
                  {hasLimit && (
                    <View style={styles.limitBarWrap}>
                      <View style={styles.limitBarBg}>
                        <LinearGradient
                          colors={isOverLimit ? ['#FF6B6B', '#FF4444'] : ['#7B95F4', '#5EE7A8']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.limitBarFill, { width: `${limitPct * 100}%` as any }]}
                        />
                      </View>
                      <Text style={[styles.limitPctText, isOverLimit && { color: '#FF6B6B' }]}>
                        {isOverLimit ? '한도 초과' : `${Math.round(limitPct * 100)}% 사용`}
                      </Text>
                    </View>
                  )}
                  <View style={styles.divider} />
                  <Row
                    label="상태"
                    value={isFrozen ? '동결됨' : '정상'}
                    rightSlot={
                      <View style={[styles.statusDot, { backgroundColor: isFrozen ? '#5BB8FF' : colors.success }]} />
                    }
                  />
                </DarkGlass>
              </View>

              {/* ── 사용 내역 ── */}
              <Section title="사용 내역">
                <DarkGlass radius="lg" style={styles.txCard}>
                  {memberTxs.length === 0 ? (
                    <Text style={styles.empty}>이 멤버의 결제 내역이 없습니다</Text>
                  ) : (
                    memberTxs.map((tx, i) => (
                      <View key={tx.hash}>
                        {i > 0 && <View style={styles.divider} />}
                        <TxRow tx={tx} />
                      </View>
                    ))
                  )}
                </DarkGlass>
              </Section>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.xxl * 2,
  },
  heroWrap: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  infoWrap: {
    paddingHorizontal: space.lg,
  },
  infoCard: {
    paddingHorizontal: space.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  actions: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  txCard: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  empty: {
    color: colors.textOnGlassFaint,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: space.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── 한도 프로그레스 바 ─────────────────────────────────────────
  limitBarWrap: {
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    gap: 5,
  },
  limitBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  limitBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  limitPctText: {
    color: colors.textOnGlassFaint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── 편집 모드 ─────────────────────────────────────────────────
  editSection: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  editCard: {
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    gap: space.sm,
  },
  editLabel: {
    color: colors.textOnGlassFaint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  editInput: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123,149,244,0.40)',
  },
  editInputSm: {
    fontSize: 15,
    flex: 1,
  },

  // 한도 프리셋
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.sm,
  },
  presetBtnWrap: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(123,149,244,0.30)',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  presetText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customLimitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.sm,
  },
  limitPreview: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
